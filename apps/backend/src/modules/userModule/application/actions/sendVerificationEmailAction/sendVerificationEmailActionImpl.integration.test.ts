import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SendVerificationEmailAction } from './sendVerificationEmailAction.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { OperationNotValidError } from '../../../../../libs/errors/operationNotValidError.js';
import { EmailEventDraft } from '../../../domain/entities/emailEvent/emailEventDraft.ts/emailEventDraft.js';
import { EmailEventType } from '../../../domain/entities/emailEvent/types/emailEventType.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type EmailMessageBus } from '../../messageBuses/emailMessageBus/emailMessageBus.js';

describe('SendVerificationEmailAction', () => {
  let commandHandler: SendVerificationEmailAction;

  let databaseClient: DatabaseClient;

  let emailMessageBus: EmailMessageBus;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<SendVerificationEmailAction>(symbols.sendVerificationEmailAction);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    emailMessageBus = container.get<EmailMessageBus>(symbols.emailMessageBus);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('sends verification email', async () => {
    const user = await userTestUtils.createAndPersist({
      input: {
        isEmailVerified: false,
      },
    });

    const sendEmailSpy = vi.spyOn(emailMessageBus, 'sendEvent');

    await commandHandler.execute({ email: user.email });

    expect(sendEmailSpy).toHaveBeenCalledWith(
      new EmailEventDraft({
        eventName: EmailEventType.verifyEmail,
        payload: {
          recipientEmail: user.email,
          emailVerificationLink: expect.any(String),
          name: user.name,
        },
      }),
    );
  });

  it('throws an error - when user not found', async () => {
    const email = Generator.email();

    try {
      await commandHandler.execute({ email });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User not found.',
        email,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when user is already verified', async () => {
    const user = await userTestUtils.createAndPersist({
      input: {
        isEmailVerified: true,
      },
    });

    try {
      await commandHandler.execute({ email: user.email });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User email is already verified.',
        email: user.email,
      });

      return;
    }

    expect.fail();
  });
});
