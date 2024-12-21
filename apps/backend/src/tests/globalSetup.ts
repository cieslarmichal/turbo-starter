import { TestContainer } from './testContainer.js';
import { UserDatabaseManager } from '../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';

export async function setup(): Promise<void> {
  try {
    const container = TestContainer.create();

    const databaseManagers = [UserDatabaseManager];

    for (const databaseManager of databaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    console.log('Database: migrations run succeed.');
  } catch (error) {
    console.log('Database: migrations run error.');

    console.log(error);

    process.exit(1);
  }
}
