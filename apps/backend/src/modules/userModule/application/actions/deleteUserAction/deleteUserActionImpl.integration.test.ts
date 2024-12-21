import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { type DeleteUserAction } from './deleteUserAction.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { ResourceNotFoundError } from '../../../../../libs/errors/resourceNotFoundError.js';
import { TestContainer } from '../../../../../tests/testContainer.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('DeleteUserAction', () => {
  let deleteUserAction: DeleteUserAction;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    deleteUserAction = container.get<DeleteUserAction>(symbols.deleteUserAction);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = new UserTestUtils(databaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('deletes a User', async () => {
    const user = await userTestUtils.createAndPersist();

    await deleteUserAction.execute({ userId: user.id });

    const foundUser = await userTestUtils.findById({ id: user.id });

    expect(foundUser).toBeUndefined();
  });

  it('throws an error if a User with given id does not exist', async () => {
    const nonExistentUser = userTestFactory.create();

    try {
      await deleteUserAction.execute({ userId: nonExistentUser.getId() });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
