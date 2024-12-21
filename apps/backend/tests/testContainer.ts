import { type S3Client } from '@aws-sdk/client-s3';

import { testSymbols } from './symbols.js';
import { Application } from '../src/core/application.js';
import { coreSymbols } from '../src/core/symbols.js';
import { type DatabaseClient } from '../src/libs/database/databaseClient.js';
import { type DependencyInjectionContainer } from '../src/libs/dependencyInjection/dependencyInjectionContainer.js';
import { S3TestUtils } from '../src/libs/s3/tests/s3TestUtils.js';
import { type SendGridService } from '../src/libs/sendGrid/sendGridService.js';
import { type EmailMessageBus } from '../src/modules/userModule/application/messageBuses/emailMessageBus/emailMessageBus.js';
import { userSymbols } from '../src/modules/userModule/symbols.js';
import { BlacklistTokenTestUtils } from '../src/modules/userModule/tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { EmailEventTestUtils } from '../src/modules/userModule/tests/utils/emailEventTestUtils/emailEventTestUtils.js';
import { UserTestUtils } from '../src/modules/userModule/tests/utils/userTestUtils/userTestUtils.js';

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
