import { beforeEach, expect, it, describe, afterEach } from 'vitest';

import { type RefreshUserTokensAction } from './refreshUserTokensAction.js';
import { type Config } from '../../../../../core/config.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { OperationNotValidError } from '../../../../../libs/errors/operationNotValidError.js';
import { Generator } from '../../../../../tests/generator.js';
import { testSymbols } from '../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../tests/testContainer.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { TokenType } from '../../../domain/types/tokenType.js';
import { symbols } from '../../../symbols.js';
import { type BlacklistTokenTestUtils } from '../../../tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('RefreshUserTokensAction', () => {
  let refreshUserTokensAction: RefreshUserTokensAction;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  let blacklistTokenTestUtils: BlacklistTokenTestUtils;

  let tokenService: TokenService;

  let config: Config;

  beforeEach(async () => {
    const container = TestContainer.create();

    refreshUserTokensAction = container.get<RefreshUserTokensAction>(symbols.refreshUserTokensAction);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    config = container.get<Config>(coreSymbols.config);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    blacklistTokenTestUtils = container.get<BlacklistTokenTestUtils>(testSymbols.blacklistTokenTestUtils);

    await userTestUtils.truncate();

    await blacklistTokenTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await blacklistTokenTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('returns new access token', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: {
        userId: user.id,
        type: TokenType.refreshToken,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    const result = await refreshUserTokensAction.execute({
      refreshToken,
    });

    const accessTokenPayload = tokenService.verifyToken({ token: result.accessToken });

    const refreshTokenPayload = tokenService.verifyToken({ token: result.refreshToken });

    expect(accessTokenPayload['userId']).toBe(user.id);

    expect(refreshTokenPayload['userId']).toBe(user.id);

    expect(result.accessTokenExpiresIn).toBe(config.token.access.expiresIn);
  });

  it('throws an error if User does not exist', async () => {
    const userId = Generator.uuid();

    const refreshToken = tokenService.createToken({
      data: {
        userId,
        type: TokenType.refreshToken,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await refreshUserTokensAction.execute({
        refreshToken,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'User not found.',
        userId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when token has a different purpose', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: {
        userId: user.id,
        type: TokenType.passwordReset,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await refreshUserTokensAction.execute({
        refreshToken,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Token type is not refresh token.',
      });

      return;
    }

    expect.fail();
  });

  it('throws an error if refresh token does not contain userId', async () => {
    const refreshToken = tokenService.createToken({
      data: {
        type: TokenType.refreshToken,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await refreshUserTokensAction.execute({
        refreshToken,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Refresh token does not contain userId.',
      });

      return;
    }

    expect.fail();
  });

  it('throws an error if refresh token is blacklisted', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await blacklistTokenTestUtils.createAndPersist({ input: { token: refreshToken } });

    try {
      await refreshUserTokensAction.execute({
        refreshToken,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Refresh token is blacklisted.',
      });

      return;
    }

    expect.fail();
  });
});
