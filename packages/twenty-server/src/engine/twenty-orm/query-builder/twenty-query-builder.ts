import {
  DataSource,
  ObjectLiteral,
  QueryRunner,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from 'typeorm';

export class TwentyQueryBuilder<
  Entity extends ObjectLiteral,
> extends SelectQueryBuilder<Entity> {
  constructor(connection: DataSource, queryRunner?: QueryRunner) {
    super(connection, queryRunner);
  }

  override update(): UpdateQueryBuilder<Entity>;

  override update(updateSet: Partial<Entity>): UpdateQueryBuilder<Entity>;

  override update(updateSet?: Partial<Entity>): UpdateQueryBuilder<Entity> {
    if (updateSet === undefined) {
      return super.update() as UpdateQueryBuilder<Entity>;
    }

    return super.update(updateSet);
  }

  async execute(): Promise<any> {
    return super.execute();
  }
}
