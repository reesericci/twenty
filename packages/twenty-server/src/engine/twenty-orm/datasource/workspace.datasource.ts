import {
  DataSource,
  DataSourceOptions,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
} from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/entity.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export class WorkspaceDataSource extends DataSource {
  readonly internalContext: WorkspaceInternalContext;
  readonly manager: WorkspaceEntityManager;

  constructor(
    internalContext: WorkspaceInternalContext,
    options: DataSourceOptions,
  ) {
    super(options);
    this.internalContext = internalContext;
    console.log(
      'WorkspaceDataSource constructor: ',
      internalContext,
      this.internalContext,
    );
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
  ): WorkspaceRepository<Entity> {
    return this.manager.getRepository(target);
  }

  override createEntityManager(queryRunner?: QueryRunner): EntityManager {
    return new WorkspaceEntityManager(this.internalContext, this, queryRunner);
  }
}
