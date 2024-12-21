import { type S3Client } from '@aws-sdk/client-s3';

import { testSymbols } from './symbols.js';
import { Application } from '../core/application.js';
import { coreSymbols } from '../core/symbols.js';
import { type DatabaseClient } from '../libs/database/databaseClient.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { S3TestUtils } from '../libs/s3/tests/s3TestUtils.js';
import { type SendGridService } from '../libs/sendGrid/sendGridService.js';
import { type EmailMessageBus } from '../modules/userModule/application/messageBuses/emailMessageBus/emailMessageBus.js';
import { userSymbols } from '../modules/userModule/symbols.js';
import { BlacklistTokenTestUtils } from '../modules/userModule/tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { EmailEventTestUtils } from '../modules/userModule/tests/utils/emailEventTestUtils/emailEventTestUtils.js';
import { UserTestUtils } from '../modules/userModule/tests/utils/userTestUtils/userTestUtils.js';

export class TestContainer {
  public static create(): DependencyInjectionContainer {
    const container = Application.createContainer();

    container.bind<UserTestUtils>(
      testSymbols.userTestUtils,
      () => new UserTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<BlacklistTokenTestUtils>(
      testSymbols.blacklistTokenTestUtils,
      () => new BlacklistTokenTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<EmailEventTestUtils>(
      testSymbols.emailEventTestUtils,
      () => new EmailEventTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.overrideBinding<SendGridService>(coreSymbols.sendGridService, () => ({
      sendEmail: async (): Promise<void> => {},
    }));

    container.overrideBinding<EmailMessageBus>(userSymbols.emailMessageBus, () => ({
      sendEvent: async (): Promise<void> => {},
    }));

    container.bind<S3TestUtils>(
      testSymbols.s3TestUtils,
      () => new S3TestUtils(container.get<S3Client>(coreSymbols.s3Client)),
    );

    return container;
  }
}
