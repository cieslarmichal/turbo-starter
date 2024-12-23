import { M1CreateUserTableMigration } from './migrations/m1CreateUserTableMigration.js';
import { M2CreateBlacklistTokenTableMigration } from './migrations/m2CreateBlacklistTokenTableMigration.js';
import { M3CreateEmailEventTableMigration } from './migrations/m3CreateEmailEventTableMigration.js';
import { type Migration } from '../../../../../libs/database/migration.js';
import { type MigrationSource } from '../../../../../libs/database/migrationSource.js';

export class UserDatabaseMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateUserTableMigration(),
      new M2CreateBlacklistTokenTableMigration(),
      new M3CreateEmailEventTableMigration(),
    ];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'userDatabaseMigrations';
  }
}
