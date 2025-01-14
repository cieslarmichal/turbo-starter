import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SendResetPasswordEmailAction } from './sendResetPasswordEmailAction.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/databaseClient.js';
import { EmailEventDraft } from '../../../domain/entities/emailEvent/emailEventDraft.ts/emailEventDraft.js';
import { EmailEventType } from '../../../domain/entities/emailEvent/types/emailEventType.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type EmailMessageBus } from '../../messageBuses/emailMessageBus/emailMessageBus.js';

describe('SendResetPasswordEmailAction', () => {
  let commandHandler: SendResetPasswordEmailAction;

  let databaseClient: DatabaseClient;

  let emailMessageBus: EmailMessageBus;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<SendResetPasswordEmailAction>(symbols.sendResetPasswordEmailAction);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    emailMessageBus = container.get<EmailMessageBus>(symbols.emailMessageBus);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('sends ResetPasswordEmail', async () => {
    const user = userTestFactory.create();

    await userTestUtils.createAndPersist({
      input: {
        email: user.getEmail(),
        name: user.getName(),
        id: user.getId(),
        isEmailVerified: true,
        password: user.getPassword(),
      },
    });

    const sendEmailSpy = vi.spyOn(emailMessageBus, 'sendEvent');

    await commandHandler.execute({
      email: user.getEmail(),
    });

    expect(sendEmailSpy).toHaveBeenCalledWith(
      new EmailEventDraft({
        eventName: EmailEventType.resetPassword,
        payload: {
          recipientEmail: user.getEmail(),
          resetPasswordLink: expect.any(String),
          name: user.getName(),
        },
      }),
    );
  });
});
