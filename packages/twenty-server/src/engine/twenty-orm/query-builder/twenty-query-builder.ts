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
    const updateQueryBuilder = new TwentyUpdateQueryBuilder(this);

    if (updateSet === undefined) {
      updateQueryBuilder.update();
    } else {
      updateQueryBuilder.update(updateSet);
    }

    return updateQueryBuilder;
  }
}

class TwentyUpdateQueryBuilder<
  Entity extends ObjectLiteral,
> extends UpdateQueryBuilder<Entity> {
  constructor(queryBuilder: SelectQueryBuilder<Entity>) {
    super(queryBuilder);
  }

  async execute(): Promise<any> {
    console.log('execute from TwentyUpdateQueryBuilder');

    const result = await super.execute();

    return result;
  }
}
