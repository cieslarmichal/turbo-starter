import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindUserAction } from './findUserAction.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { ResourceNotFoundError } from '../../../../../libs/errors/resourceNotFoundError.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUserAction', () => {
  let findUserAction: FindUserAction;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    findUserAction = container.get<FindUserAction>(symbols.findUserAction);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = new UserTestUtils(databaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('finds a User by id', async () => {
    const user = await userTestUtils.createAndPersist();

    const { user: foundUser } = await findUserAction.execute({ userId: user.id });

    expect(foundUser).not.toBeNull();
  });

  it('throws an error if a User with given id does not exist', async () => {
    const nonExistentUser = userTestFactory.create();

    try {
      await findUserAction.execute({ userId: nonExistentUser.getId() });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
