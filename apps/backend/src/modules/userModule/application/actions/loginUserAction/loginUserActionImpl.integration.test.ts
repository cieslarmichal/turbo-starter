import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type LoginUserAction } from './loginUserAction.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type Config } from '../../../../../core/config.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { ForbiddenAccessError } from '../../../../../libs/errors/forbiddenAccessError.js';
import { UnauthorizedAccessError } from '../../../../../libs/errors/unathorizedAccessError.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type HashService } from '../../services/hashService/hashService.js';

describe('LoginUserAction', () => {
  let loginUserAction: LoginUserAction;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  let tokenService: TokenService;

  let hashService: HashService;

  let config: Config;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    loginUserAction = container.get<LoginUserAction>(symbols.loginUserAction);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    config = container.get<Config>(coreSymbols.config);

    hashService = container.get<HashService>(symbols.hashService);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('returns tokens', async () => {
    const createdUser = userTestFactory.create({ isEmailVerified: true });

    const hashedPassword = await hashService.hash({ plainData: createdUser.getPassword() });

    await userTestUtils.persist({
      user: {
        id: createdUser.getId(),
        email: createdUser.getEmail(),
        password: hashedPassword,
        name: createdUser.getName(),
        isEmailVerified: createdUser.getIsEmailVerified(),
        isDeleted: createdUser.getIsDeleted(),
        role: createdUser.getRole(),
      },
    });

    const { accessToken, refreshToken, accessTokenExpiresIn } = await loginUserAction.execute({
      email: createdUser.getEmail(),
      password: createdUser.getPassword(),
    });

    const accessTokenPayload = tokenService.verifyToken({ token: accessToken });

    const refreshTokenPayload = tokenService.verifyToken({ token: refreshToken });

    expect(accessTokenPayload['userId']).toBe(createdUser.getId());

    expect(accessTokenPayload['role']).toBe(createdUser.getRole());

    expect(refreshTokenPayload['userId']).toBe(createdUser.getId());

    expect(accessTokenExpiresIn).toBe(config.token.access.expiresIn);
  });

  it('throws an error if User email is not verified', async () => {
    const createdUser = userTestFactory.create();

    const hashedPassword = await hashService.hash({ plainData: createdUser.getPassword() });

    await userTestUtils.persist({
      user: {
        id: createdUser.getId(),
        email: createdUser.getEmail(),
        password: hashedPassword,
        name: createdUser.getName(),
        isEmailVerified: false,
        isDeleted: createdUser.getIsDeleted(),
        role: createdUser.getRole(),
      },
    });

    try {
      await loginUserAction.execute({
        email: createdUser.getEmail(),
        password: createdUser.getPassword(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenAccessError);

      expect((error as ForbiddenAccessError).context).toMatchObject({
        reason: 'User email is not verified.',
        email: createdUser.getEmail(),
      });

      return;
    }

    expect.fail();
  });

  it('throws an error if User is blocked', async () => {
    const createdUser = userTestFactory.create();

    const hashedPassword = await hashService.hash({ plainData: createdUser.getPassword() });

    await userTestUtils.persist({
      user: {
        id: createdUser.getId(),
        email: createdUser.getEmail(),
        password: hashedPassword,
        name: createdUser.getName(),
        isEmailVerified: true,
        isDeleted: true,
        role: createdUser.getRole(),
      },
    });

    try {
      await loginUserAction.execute({
        email: createdUser.getEmail(),
        password: createdUser.getPassword(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenAccessError);

      expect((error as ForbiddenAccessError).context).toMatchObject({
        reason: 'User is blocked.',
        email: createdUser.getEmail(),
      });

      return;
    }

    expect.fail();
  });

  it('throws an error if a User with given email does not exist', async () => {
    const nonExistentUser = userTestFactory.create();

    try {
      await loginUserAction.execute({
        email: nonExistentUser.getEmail(),
        password: nonExistentUser.getPassword(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedAccessError);

      expect((error as UnauthorizedAccessError).context).toMatchObject({
        reason: 'Invalid credentials.',
        email: nonExistentUser.getEmail(),
      });

      return;
    }

    expect.fail();
  });

  it(`throws an error if User's password does not match stored password`, async () => {
    const { email, password } = await userTestUtils.createAndPersist({ input: { isEmailVerified: true } });

    try {
      await loginUserAction.execute({
        email,
        password,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedAccessError);

      expect((error as UnauthorizedAccessError).context).toMatchObject({
        reason: 'Invalid credentials.',
        email,
      });

      return;
    }

    expect.fail();
  });
});
