import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { userTable } from '../../../infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { UserTestFactory } from '../../factories/userTestFactory/userTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<UserRawEntity>;
}

interface PersistPayload {
  readonly user: UserRawEntity;
}

interface FindByEmailPayload {
  readonly email: string;
}

interface FindByIdPayload {
  readonly id: string;
}

export class UserTestUtils extends TestUtils {
  private readonly userTestFactory = new UserTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, userTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserRawEntity> {
    const { input } = payload;

    const user = this.userTestFactory.create(input);

    const rawEntities = await this.databaseClient<UserRawEntity>(userTable).insert(
      {
        id: user.getId(),
        email: user.getEmail(),
        name: user.getName(),
        password: user.getPassword(),
        isEmailVerified: user.getIsEmailVerified(),
        isDeleted: user.getIsDeleted(),
        role: user.getRole(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as UserRawEntity;

    return rawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { user } = payload;

    await this.databaseClient<UserRawEntity>(userTable).insert(user, '*');
  }

  public async findByEmail(payload: FindByEmailPayload): Promise<UserRawEntity | undefined> {
    const { email: emailInput } = payload;

    const email = emailInput.toLowerCase();

    const rawEntity = await this.databaseClient<UserRawEntity>(userTable).select('*').where({ email }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserRawEntity | undefined> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<UserRawEntity>(userTable).select('*').where({ id }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }
}
