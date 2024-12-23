import { type DatabaseClient } from '../../../../../../libs/database/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/migration.js';

export class M3CreateEmailEventTableMigration implements Migration {
  public readonly name = 'M3CreateEmailEventTableMigration';

  private readonly tableName = 'emailEvents';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.string('id', 36).notNullable();

      table.text('payload').notNullable();

      table.string('status', 20).notNullable();

      table.string('eventName', 20).notNullable();

      table.dateTime('createdAt').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
