/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifyMultipart } from '@fastify/multipart';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { fastify, type FastifyInstance } from 'fastify';
import { type FastifySchemaValidationError } from 'fastify/types/schema.js';

import { type ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type Config } from './config.js';
import { HttpRouter } from './httpRouter.js';
import { coreSymbols, symbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { ForbiddenAccessError } from '../libs/errors/forbiddenAccessError.js';
import { InputNotValidError } from '../libs/errors/inputNotValidError.js';
import { OperationNotValidError } from '../libs/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../libs/errors/resourceAlreadyExistsError.js';
import { ResourceNotFoundError } from '../libs/errors/resourceNotFoundError.js';
import { serializeError } from '../libs/errors/serializeError.js';
import { UnauthorizedAccessError } from '../libs/errors/unathorizedAccessError.js';
import { type HttpController } from '../libs/http/httpController.js';
import { HttpStatusCode } from '../libs/http/httpStatusCode.js';
import { type LoggerService } from '../libs/logger/loggerService.js';
import { type UserHttpController } from '../modules/userModule/api/httpControllers/userHttpController/userHttpController.js';
import { userSymbols } from '../modules/userModule/symbols.js';

export class HttpServer {
  public readonly fastifyServer: FastifyInstance;
  private readonly httpRouter: HttpRouter;
  private readonly container: DependencyInjectionContainer;
  private readonly loggerService: LoggerService;
  private readonly config: Config;

  public constructor(container: DependencyInjectionContainer) {
    this.container = container;

    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);

    this.config = container.get<Config>(coreSymbols.config);

    this.fastifyServer = fastify({ bodyLimit: 10 * 1024 * 1024 }).withTypeProvider<TypeBoxTypeProvider>();

    this.httpRouter = new HttpRouter(this.fastifyServer);
  }

  private getControllers(): HttpController[] {
    return [
      this.container.get<ApplicationHttpController>(symbols.applicationHttpController),
      this.container.get<UserHttpController>(userSymbols.userHttpController),
    ];
  }

  public async start(): Promise<void> {
    const { host, port } = this.config.server;

    this.setupErrorHandler();

    await this.initSwagger();

    await this.fastifyServer.register(fastifyMultipart, {
      limits: {
        fileSize: 1024 * 1024 * 1024 * 4,
      },
    });

    await this.fastifyServer.register(fastifyHelmet);

    await this.fastifyServer.register(fastifyCors, {
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
    });

    this.fastifyServer.addHook('onRequest', (request, _reply, done) => {
      if (
        request.url.includes(`${this.httpRouter.rootPath}/docs`) ||
        request.url.includes(`${this.httpRouter.rootPath}/health`)
      ) {
        return done();
      }

      this.loggerService.info({
        message: 'HTTP request received.',
        endpoint: `${request.method} ${request.url}`,
      });

      done();
    });

    this.fastifyServer.addHook('onSend', (request, reply, _payload, done) => {
      if (
        request.url.includes(`${this.httpRouter.rootPath}/docs`) ||
        request.url.includes(`${this.httpRouter.rootPath}/health`)
      ) {
        return done();
      }

      this.loggerService.info({
        message: 'HTTP response sent.',
        endpoint: `${request.method} ${request.url}`,
        statusCode: reply.statusCode,
      });

      done();
    });

    this.fastifyServer.setSerializerCompiler(() => {
      return (data): string => JSON.stringify(data);
    });

    this.addRequestPreprocessing();

    this.httpRouter.registerControllers({
      controllers: this.getControllers(),
    });

    await this.fastifyServer.listen({
      port,
      host,
    });

    this.loggerService.info({
      message: 'HTTP Server started.',
      port,
      host,
    });
  }

  public async stop(): Promise<void> {
    await this.fastifyServer.close();

    this.loggerService.info({
      message: 'HTTP Server stopped.',
    });
  }

  private setupErrorHandler(): void {
    this.fastifyServer.setSchemaErrorFormatter((errors, dataVar) => {
      const { instancePath, message } = errors[0] as FastifySchemaValidationError;

      return new InputNotValidError({
        reason: `${dataVar}${instancePath} ${message}`,
        value: undefined,
      });
    });

    this.fastifyServer.setErrorHandler((error, request, reply) => {
      const serializedError = serializeError(error);

      this.loggerService.error({
        message: 'Caught an error in HTTP server.',
        endpoint: `${request.method} ${request.url}`,
        error: serializedError,
      });

      const responseError = {
        ...serializedError,
        stack: undefined,
        cause: undefined,
        context: {
          ...(serializedError['context'] ? (serializedError['context'] as Record<string, unknown>) : {}),
          originalError: undefined,
        },
      };

      if (error instanceof InputNotValidError) {
        return reply.status(HttpStatusCode.badRequest).send(responseError);
      }

      if (error instanceof ResourceNotFoundError) {
        return reply.status(HttpStatusCode.notFound).send(responseError);
      }

      if (error instanceof OperationNotValidError) {
        return reply.status(HttpStatusCode.badRequest).send(responseError);
      }

      if (error instanceof ResourceAlreadyExistsError) {
        return reply.status(HttpStatusCode.conflict).send(responseError);
      }

      if (error instanceof UnauthorizedAccessError) {
        return reply.status(HttpStatusCode.unauthorized).send(responseError);
      }

      if (error instanceof ForbiddenAccessError) {
        return reply.status(HttpStatusCode.forbidden).send(responseError);
      }

      return reply.status(HttpStatusCode.internalServerError).send({
        name: 'InternalServerError',
        message: 'Internal server error',
      });
    });
  }

  private async initSwagger(): Promise<void> {
    await this.fastifyServer.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Backend API',
          version: '1.0.0',
        },
      },
    });

    await this.fastifyServer.register(fastifySwaggerUi, {
      routePrefix: `${this.httpRouter.rootPath}/docs`,
      uiConfig: {
        defaultModelRendering: 'model',
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
      },
      staticCSP: true,
    });
  }

  private addRequestPreprocessing(): void {
    this.fastifyServer.addHook('preValidation', (request, _reply, next) => {
      const body = request.body as Record<string, unknown>;

      this.trimStringProperties(body);

      next();
    });
  }

  private trimStringProperties(obj: Record<string, any>): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.trimStringProperties(obj[key]);
      }
    }
  }
}
