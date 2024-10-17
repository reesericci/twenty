import { Injectable, Logger } from '@nestjs/common';

import {
  DataSource,
  EntitySchema,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { CacheManager } from 'src/engine/twenty-orm/storage/cache-manager.storage';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

function createGenericSubscriber(workspaceId: string) {
  return class GenericSubscriber implements EntitySubscriberInterface {
    private readonly logger = new Logger(GenericSubscriber.name);

    constructor(dataSource: DataSource) {
      dataSource.subscribers.push(this);
      this.logger.log(
        `GenericSubscriber registered for workspace ${workspaceId}`,
      );
    }

    afterLoad(entity: any) {
      this.logger.log(`Entity loaded for workspace ${workspaceId}:`, entity);
    }

    beforeInsert(event: InsertEvent<any>) {
      this.logger.log(
        `Before insert in workspace ${workspaceId}:`,
        event.entity,
      );
    }

    afterInsert(event: InsertEvent<any>) {
      this.logger.log(
        `After insert in workspace ${workspaceId}:`,
        event.entity,
      );
    }

    beforeUpdate(event: UpdateEvent<any>) {
      this.logger.log(
        `Before update in workspace ${workspaceId}:`,
        event.entity,
      );
    }

    afterUpdate(event: UpdateEvent<any>) {
      this.logger.log(
        `After update in workspace ${workspaceId}:`,
        event.entity,
      );
    }

    beforeRemove(event: RemoveEvent<any>) {
      this.logger.log(
        `Before remove in workspace ${workspaceId}:`,
        event.entity,
      );
    }

    afterRemove(event: RemoveEvent<any>) {
      this.logger.log(
        `After remove in workspace ${workspaceId}:`,
        event.entity,
      );
    }
  };
}

@Injectable()
export class WorkspaceDatasourceFactory {
  private readonly logger = new Logger(WorkspaceDatasourceFactory.name);
  private cacheManager = new CacheManager<WorkspaceDataSource>();
  private cachedDatasourcePromise: Record<string, Promise<WorkspaceDataSource>>;

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {
    this.cachedDatasourcePromise = {};
  }

  public async create(
    workspaceId: string,
    workspaceMetadataVersion: number | null,
    failOnMetadataCacheMiss = true,
  ): Promise<WorkspaceDataSource> {
    const cachedWorkspaceMetadataVersion =
      await this.getWorkspaceMetadataVersionFromCache(
        workspaceId,
        failOnMetadataCacheMiss,
      );

    if (
      workspaceMetadataVersion !== null &&
      cachedWorkspaceMetadataVersion !== workspaceMetadataVersion
    ) {
      throw new TwentyORMException(
        `Workspace metadata version mismatch detected for workspace ${workspaceId}. Current version: ${cachedWorkspaceMetadataVersion}. Desired version: ${workspaceMetadataVersion}`,
        TwentyORMExceptionCode.METADATA_VERSION_MISMATCH,
      );
    }

    const cacheKey = `${workspaceId}-${cachedWorkspaceMetadataVersion}`;

    if (cacheKey in this.cachedDatasourcePromise) {
      return this.cachedDatasourcePromise[cacheKey];
    }

    const creationPromise = (async (): Promise<WorkspaceDataSource> => {
      try {
        const result = await this.cacheManager.execute(
          cacheKey as '`${string}-${string}`',
          async () => {
            this.logger.log(
              `Creating workspace data source for workspace ${workspaceId} and metadata version ${cachedWorkspaceMetadataVersion}`,
            );

            const dataSourceMetadata =
              await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
                workspaceId,
              );

            if (!dataSourceMetadata) {
              throw new TwentyORMException(
                `Workspace Schema not found for workspace ${workspaceId}`,
                TwentyORMExceptionCode.WORKSPACE_SCHEMA_NOT_FOUND,
              );
            }

            const cachedEntitySchemaOptions =
              await this.workspaceCacheStorageService.getORMEntitySchema(
                workspaceId,
                cachedWorkspaceMetadataVersion,
              );

            let cachedEntitySchemas: EntitySchema[];

            const cachedObjectMetadataMap =
              await this.workspaceCacheStorageService.getObjectMetadataMap(
                workspaceId,
                cachedWorkspaceMetadataVersion,
              );

            if (!cachedObjectMetadataMap) {
              throw new TwentyORMException(
                `Workspace Schema not found for workspace ${workspaceId}`,
                TwentyORMExceptionCode.METADATA_COLLECTION_NOT_FOUND,
              );
            }

            if (cachedEntitySchemaOptions) {
              cachedEntitySchemas = cachedEntitySchemaOptions.map(
                (option) => new EntitySchema(option),
              );
            } else {
              const entitySchemas = await Promise.all(
                Object.values(cachedObjectMetadataMap).map((objectMetadata) =>
                  this.entitySchemaFactory.create(
                    workspaceId,
                    cachedWorkspaceMetadataVersion,
                    objectMetadata,
                    cachedObjectMetadataMap,
                  ),
                ),
              );

              await this.workspaceCacheStorageService.setORMEntitySchema(
                workspaceId,
                cachedWorkspaceMetadataVersion,
                entitySchemas.map((entitySchema) => entitySchema.options),
              );

              cachedEntitySchemas = entitySchemas;
            }

            const GenericSubscriber = createGenericSubscriber(workspaceId);

            const workspaceDataSource = new WorkspaceDataSource(
              {
                workspaceId,
                objectMetadataMap: cachedObjectMetadataMap,
              },
              {
                url:
                  dataSourceMetadata.url ??
                  this.environmentService.get('PG_DATABASE_URL'),
                type: 'postgres',
                logging: this.environmentService.get('DEBUG_MODE')
                  ? ['query', 'error']
                  : ['error'],
                schema: dataSourceMetadata.schema,
                subscribers: [GenericSubscriber],
                entities: cachedEntitySchemas,
                ssl: this.environmentService.get('PG_SSL_ALLOW_SELF_SIGNED')
                  ? {
                      rejectUnauthorized: false,
                    }
                  : undefined,
              },
            );

            await workspaceDataSource.initialize();

            new GenericSubscriber(workspaceDataSource);

            return workspaceDataSource;
          },
          async (dataSource) => {
            try {
              await dataSource.destroy();
            } catch (error) {
              // Ignore error if pool has already been destroyed which is a common race condition case
              if (error.message === 'Called end on pool more than once') {
                return;
              }

              throw error;
            }
          },
        );

        if (result === null) {
          throw new Error(
            `Failed to create WorkspaceDataSource for ${cacheKey}`,
          );
        }

        return result;
      } finally {
        delete this.cachedDatasourcePromise[cacheKey];
      }
    })();

    this.cachedDatasourcePromise[cacheKey] = creationPromise;

    return creationPromise;
  }

  public async destroy(workspaceId: string): Promise<void> {
    const cachedWorkspaceMetadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    await this.cacheManager.clearKey(
      `${workspaceId}-${cachedWorkspaceMetadataVersion}`,
    );
  }

  private async getWorkspaceMetadataVersionFromCache(
    workspaceId: string,
    failOnMetadataCacheMiss = true,
  ): Promise<number> {
    let latestWorkspaceMetadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (latestWorkspaceMetadataVersion === undefined) {
      await this.workspaceMetadataCacheService.recomputeMetadataCache({
        workspaceId,
        ignoreLock: !failOnMetadataCacheMiss,
      });

      if (failOnMetadataCacheMiss) {
        throw new TwentyORMException(
          `Metadata version not found for workspace ${workspaceId}`,
          TwentyORMExceptionCode.METADATA_VERSION_NOT_FOUND,
        );
      } else {
        latestWorkspaceMetadataVersion =
          await this.workspaceCacheStorageService.getMetadataVersion(
            workspaceId,
          );
      }
    }

    if (!latestWorkspaceMetadataVersion) {
      throw new TwentyORMException(
        `Metadata version not found after recompute for workspace ${workspaceId}`,
        TwentyORMExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    return latestWorkspaceMetadataVersion;
  }
}
