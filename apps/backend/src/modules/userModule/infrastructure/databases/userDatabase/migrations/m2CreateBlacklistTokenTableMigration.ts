import { type DatabaseClient } from '../../../../../../libs/database/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/migration.js';

export class M2CreateBlacklistTokenTableMigration implements Migration {
  public readonly name = 'M2CreateBlacklistTokenTableMigration';

  private readonly tableName = 'blacklistTokens';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.string('id', 36).notNullable();

      table.text('token').notNullable();

      table.timestamp('expiresAt').notNullable();

      table.primary(['id']);

      table.unique(['token']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
