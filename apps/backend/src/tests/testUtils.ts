import { type DatabaseClient } from '../libs/database/databaseClient.js';

export class TestUtils {
  public constructor(
    protected readonly databaseClient: DatabaseClient,
    protected readonly databaseTable: string,
  ) {}

  public async truncate(): Promise<void> {
    await this.databaseClient.raw(`TRUNCATE TABLE "${this.databaseTable}" CASCADE;`);
  }
}
