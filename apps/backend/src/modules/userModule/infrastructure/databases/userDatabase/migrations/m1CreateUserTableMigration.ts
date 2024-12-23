import { type DatabaseClient } from '../../../../../../libs/database/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/migration.js';

export class M1CreateUserTableMigration implements Migration {
  public readonly name = 'M1CreateUserTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('users', (table) => {
      table.string('id', 36).notNullable();

      table.string('email', 254).notNullable();

      table.string('password', 100).notNullable();

      table.string('name', 100).notNullable();

      table.boolean('isEmailVerified').notNullable();

      table.boolean('isDeleted').notNullable();

      table.string('role', 10).notNullable();

      table.primary(['id']);

      table.unique(['email']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('users');
  }
}
