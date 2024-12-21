import { type S3Client } from '@aws-sdk/client-s3';

import { ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { createConfig, type Config } from './config.js';
import { HttpServer } from './httpServer.js';
import { coreSymbols, symbols } from './symbols.js';
import { type DatabaseClient } from '../libs/database/databaseClient.js';
import { DatabaseClientFactory } from '../libs/database/databaseClientFactory.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { type HttpService } from '../libs/httpService/httpService.js';
import { HttpServiceImpl } from '../libs/httpService/httpServiceImpl.js';
import { type LoggerService } from '../libs/logger/loggerService.js';
import { LoggerServiceFactory } from '../libs/logger/loggerServiceFactory.js';
import { type S3Config, S3ClientFactory } from '../libs/s3/s3ClientFactory.js';
import { S3Service } from '../libs/s3/s3Service.js';
import { type SendGridService } from '../libs/sendGrid/sendGridService.js';
import { SendGridServiceImpl } from '../libs/sendGrid/sendGridServiceImpl.js';
import { UuidService } from '../libs/uuid/uuidService.js';
import { AuthModule } from '../modules/authModule/authModule.js';
import { UserDatabaseManager } from '../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';
import { UserModule } from '../modules/userModule/userModule.js';

export class Application {
  private static container: DependencyInjectionContainer;
  private static server: HttpServer;

  public static createContainer(): DependencyInjectionContainer {
    const modules: DependencyInjectionModule[] = [new UserModule(), new AuthModule()];

    const container = DependencyInjectionContainerFactory.create({ modules });

    const config = createConfig();

    container.bind<LoggerService>(symbols.loggerService, () =>
      LoggerServiceFactory.create({ logLevel: config.logLevel }),
    );

    container.bind<HttpService>(
      symbols.httpService,
      () => new HttpServiceImpl(container.get<LoggerService>(symbols.loggerService)),
    );

    container.bind<UuidService>(symbols.uuidService, () => new UuidService());

    container.bind<Config>(symbols.config, () => config);

    container.bind<DatabaseClient>(symbols.databaseClient, () =>
      DatabaseClientFactory.create({
        host: config.database.host,
        port: config.database.port,
        databaseName: config.database.name,
        user: config.database.username,
        password: config.database.password,
        useNullAsDefault: true,
        minPoolConnections: 1,
        maxPoolConnections: 10,
      }),
    );

    container.bind<ApplicationHttpController>(
      symbols.applicationHttpController,
      () =>
        new ApplicationHttpController(
          container.get<DatabaseClient>(coreSymbols.databaseClient),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<SendGridService>(
      symbols.sendGridService,
      () =>
        new SendGridServiceImpl(container.get<HttpService>(coreSymbols.httpService), {
          apiKey: config.sendGrid.apiKey,
          senderEmail: config.sendGrid.senderEmail,
        }),
    );

    const s3Config: S3Config = {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
      endpoint: config.aws.endpoint ?? undefined,
    };

    container.bind<S3Client>(symbols.s3Client, () => S3ClientFactory.create(s3Config));

    container.bind<S3Service>(symbols.s3Service, () => new S3Service(container.get<S3Client>(coreSymbols.s3Client)));

    return container;
  }

  public static async start(): Promise<void> {
    Application.container = Application.createContainer();

    await this.setupDatabase();

    Application.server = new HttpServer(Application.container);

    await Application.server.start();
  }

  public static async stop(): Promise<void> {
    await Application.server.stop();
  }

  private static async setupDatabase(): Promise<void> {
    const coreDatabaseManagers = [UserDatabaseManager];

    for await (const databaseManager of coreDatabaseManagers) {
      await databaseManager.bootstrapDatabase(Application.container);
    }

    const loggerService = Application.container.get<LoggerService>(coreSymbols.loggerService);

    loggerService.debug({ message: 'Database migrations run succeed.' });
  }
}
