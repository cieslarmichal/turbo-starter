import { checkHealthResponseBodySchema, type CheckHealthResponseBody } from './schemas/checkHealthSchema.js';
import { type DatabaseClient } from '../../../../libs/database/databaseClient.js';
import { serializeError } from '../../../../libs/errors/serializeError.js';
import { type HttpController } from '../../../../libs/http/httpController.js';
import { HttpMethodName } from '../../../../libs/http/httpMethodName.js';
import { type HttpOkResponse } from '../../../../libs/http/httpResponse.js';
import { HttpRoute } from '../../../../libs/http/httpRoute.js';
import { HttpStatusCode } from '../../../../libs/http/httpStatusCode.js';
import { type LoggerService } from '../../../../libs/logger/loggerService.js';

export class ApplicationHttpController implements HttpController {
  public readonly basePath = '/health';
  public readonly tags = ['Health'];

  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly logger: LoggerService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.checkHealth.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              schema: checkHealthResponseBodySchema,
              description: 'Application is healthy',
            },
          },
        },
        description: 'Check application health',
      }),
    ];
  }

  private async checkHealth(): Promise<HttpOkResponse<CheckHealthResponseBody>> {
    const isDatabaseHealthy = await this.checkDatabaseHealth();

    const isApplicationHealthy = isDatabaseHealthy;

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        healthy: isApplicationHealthy,
        checks: [
          {
            name: 'Database',
            healthy: isDatabaseHealthy,
          },
        ],
      },
    };
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.databaseClient.raw('SELECT 1');

      return true;
    } catch (error) {
      this.logger.error({
        message: 'Database health check failed',
        error: serializeError(error),
      });

      return false;
    }
  }
}
