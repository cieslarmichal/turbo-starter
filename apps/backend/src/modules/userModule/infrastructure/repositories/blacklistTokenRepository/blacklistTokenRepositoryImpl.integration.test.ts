import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { TestContainer } from '../../../../../../tests/testContainer.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { RepositoryError } from '../../../../../libs/errors/repositoryError.js';
import { type BlacklistTokenRepository } from '../../../domain/repositories/blacklistTokenRepository/blacklistTokenRepository.js';
import { symbols } from '../../../symbols.js';
import { BlacklistTokenTestFactory } from '../../../tests/factories/blacklistTokenTestFactory/blacklistTokenTestFactory.js';
import { BlacklistTokenTestUtils } from '../../../tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';

describe('BlacklistTokenRepositoryImpl', () => {
  let blacklistTokenRepository: BlacklistTokenRepository;

  let databaseClient: DatabaseClient;

  let blacklistTokenTestUtils: BlacklistTokenTestUtils;

  const blacklistTokenTestFactory = new BlacklistTokenTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    blacklistTokenRepository = container.get<BlacklistTokenRepository>(symbols.blacklistTokenRepository);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    blacklistTokenTestUtils = new BlacklistTokenTestUtils(databaseClient);

    await blacklistTokenTestUtils.truncate();
  });

  afterEach(async () => {
    await blacklistTokenTestUtils.truncate();

    await databaseClient.destroy();
  });

  describe('Create', () => {
    it('creates a BlacklistToken', async () => {
      const createdBlacklistToken = blacklistTokenTestFactory.create();

      const token = createdBlacklistToken.getToken();

      const expiresAt = createdBlacklistToken.getExpiresAt();

      const blacklistToken = await blacklistTokenRepository.createBlacklistToken({
        token,
        expiresAt,
      });

      const foundBlacklistToken = await blacklistTokenTestUtils.findByToken({ token });

      expect(blacklistToken.getToken()).toEqual(token);

      expect(blacklistToken.getExpiresAt()).toEqual(expiresAt);

      expect(foundBlacklistToken).toEqual({
        id: blacklistToken.getId(),
        token,
        expiresAt,
      });
    });

    it('throws an error when a BlacklistToken with the same email already exists', async () => {
      const existingBlacklistToken = await blacklistTokenTestUtils.createAndPersist();

      try {
        await blacklistTokenRepository.createBlacklistToken({
          token: existingBlacklistToken.token,
          expiresAt: existingBlacklistToken.expiresAt,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        return;
      }

      expect.fail();
    });
  });

  describe('Find', () => {
    it('finds a BlacklistToken by token', async () => {
      const blacklistToken = await blacklistTokenTestUtils.createAndPersist();

      const foundBlacklistToken = await blacklistTokenRepository.findBlacklistToken({ token: blacklistToken.token });

      expect(foundBlacklistToken).not.toBeNull();
    });

    it('returns null if a BlacklistToken with given token does not exist', async () => {
      const createdBlacklistToken = blacklistTokenTestFactory.create();

      const blacklistToken = await blacklistTokenRepository.findBlacklistToken({
        token: createdBlacklistToken.getToken(),
      });

      expect(blacklistToken).toBeNull();
    });
  });
});
