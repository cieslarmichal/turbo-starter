/* eslint-disable @typescript-eslint/naming-convention */

import { type FastifyInstance, type FastifyReply, type FastifyRequest, type FastifySchema } from 'fastify';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';

import { type HttpController } from '../libs/http/httpController.js';
import { HttpHeader } from '../libs/http/httpHeader.js';
import { HttpMediaType } from '../libs/http/httpMediaType.js';
import { type AttachedFile } from '../libs/http/httpRequest.js';
import { type HttpRoute, type HttpRouteSchema } from '../libs/http/httpRoute.js';

const streamPipeline = promisify(pipeline);

export interface RegisterControllersPayload {
  readonly controllers: HttpController[];
}

export interface RegisterRoutesPayload {
  readonly routes: HttpRoute[];
  readonly basePath: string;
  readonly tags: string[];
}

export interface NormalizePathPayload {
  readonly path: string;
}

export class HttpRouter {
  public readonly rootPath = '/api/v1';

  public constructor(private readonly fastifyServer: FastifyInstance) {}

  public registerControllers(payload: RegisterControllersPayload): void {
    const { controllers } = payload;

    controllers.forEach((controller) => {
      const { basePath, tags } = controller;

      const routes = controller.getHttpRoutes();

      this.registerControllerRoutes({
        routes,
        basePath,
        tags,
      });
    });
  }

  private registerControllerRoutes(payload: RegisterRoutesPayload): void {
    const { routes, basePath, tags } = payload;

    routes.map((httpRoute) => {
      const { method, path: controllerPath, description, preValidation: preValidationHook } = httpRoute;

      const path = this.normalizePath({ path: `/${this.rootPath}/${basePath}/${controllerPath}` });

      const handler = async (fastifyRequest: FastifyRequest, fastifyReply: FastifyReply): Promise<void> => {
        let attachedFiles: AttachedFile[] | undefined;

        if (fastifyRequest.isMultipart()) {
          attachedFiles = [];

          const files = fastifyRequest.files();

          for await (const file of files) {
            const { filename, file: data } = file;

            const filePath = `/tmp/${filename}`;

            const writer = createWriteStream(filePath);

            await streamPipeline(data, writer);

            attachedFiles.push({
              name: filename,
              filePath,
            });
          }
        }

        const { statusCode, body: responseBody } = await httpRoute.handler({
          body: fastifyRequest.body,
          pathParams: fastifyRequest.params,
          queryParams: fastifyRequest.query,
          headers: fastifyRequest.headers as Record<string, string>,
          files: attachedFiles,
        });

        fastifyReply.status(statusCode);

        if (responseBody) {
          fastifyReply.header(HttpHeader.contentType, HttpMediaType.applicationJson).send(responseBody);
        } else {
          fastifyReply.send();
        }

        return fastifyReply;
      };

      this.fastifyServer.route({
        method,
        url: path,
        handler,
        schema: {
          description,
          tags,
          ...this.mapToFastifySchema(httpRoute.schema),
        },
        ...(preValidationHook
          ? {
              preValidation: (request, _reply, next): void => {
                preValidationHook(request);

                next();
              },
            }
          : undefined),
      });
    });
  }

  private mapToFastifySchema(routeSchema: HttpRouteSchema): FastifySchema {
    const { pathParams, queryParams, body } = routeSchema.request;

    const fastifySchema: FastifySchema = {};

    if (pathParams) {
      fastifySchema.params = pathParams;
    }

    if (queryParams) {
      fastifySchema.querystring = queryParams;
    }

    if (body) {
      fastifySchema.body = body;
    }

    fastifySchema.response = Object.entries(routeSchema.response).reduce((agg, [statusCode, statusCodeSchema]) => {
      const { schema, description } = statusCodeSchema;

      return {
        ...agg,
        [statusCode]: {
          ...schema,
          description,
        },
      };
    }, {});

    return fastifySchema;
  }

  private normalizePath(payload: NormalizePathPayload): string {
    const { path } = payload;

    const urlWithoutDoubleSlashes = path.replace(/(\/+)/g, '/');

    const urlWithoutTrailingSlash = urlWithoutDoubleSlashes.replace(/(\/)$/g, '');

    return urlWithoutTrailingSlash;
  }
}
