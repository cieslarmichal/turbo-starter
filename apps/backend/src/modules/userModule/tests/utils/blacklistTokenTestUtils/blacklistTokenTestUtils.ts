import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { type BlacklistTokenRawEntity } from '../../../infrastructure/databases/userDatabase/tables/blacklistTokenTable/blacklistTokenRawEntity.js';
import { blacklistTokenTable } from '../../../infrastructure/databases/userDatabase/tables/blacklistTokenTable/blacklistTokenTable.js';
import { BlacklistTokenTestFactory } from '../../factories/blacklistTokenTestFactory/blacklistTokenTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BlacklistTokenRawEntity>;
}

interface PersistPayload {
  readonly blacklistToken: BlacklistTokenRawEntity;
}

interface FindByTokenPayload {
  readonly token: string;
}

export class BlacklistTokenTestUtils extends TestUtils {
  private readonly blacklistTokenTestFactory = new BlacklistTokenTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, blacklistTokenTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<BlacklistTokenRawEntity> {
    const { input } = payload;

    const blacklistToken = this.blacklistTokenTestFactory.create(input);

    const rawEntities = await this.databaseClient<BlacklistTokenRawEntity>(blacklistTokenTable).insert(
      {
        id: blacklistToken.getId(),
        token: blacklistToken.getToken(),
        expiresAt: blacklistToken.getExpiresAt(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BlacklistTokenRawEntity;

    return rawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { blacklistToken } = payload;

    await this.databaseClient<BlacklistTokenRawEntity>(blacklistTokenTable).insert(blacklistToken, '*');
  }

  public async findByToken(payload: FindByTokenPayload): Promise<BlacklistTokenRawEntity> {
    const { token } = payload;

    const rawEntity = await this.databaseClient<BlacklistTokenRawEntity>(blacklistTokenTable)
      .select('*')
      .where({ token })
      .first();

    return rawEntity as BlacklistTokenRawEntity;
  }
}
