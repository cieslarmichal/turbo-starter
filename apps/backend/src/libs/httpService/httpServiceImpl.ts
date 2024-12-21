import { stringify } from 'querystring';

import fetch from 'node-fetch';

import { type LoggerService } from '../logger/loggerService.js';
import { HttpServiceError } from './errors/httpServiceError.js';
import { type HttpService, type SendRequestPayload } from './httpService.js';
import { type HttpResponse } from '../http/httpResponse.js';

export class HttpServiceImpl implements HttpService {
  public constructor(private readonly loggerService: LoggerService) {}

  public async sendRequest<ResponseBody>(payload: SendRequestPayload): Promise<HttpResponse<ResponseBody>> {
    const { method, url: initialUrl, headers, queryParams, body: requestBody } = payload;

    const body = JSON.stringify(requestBody);

    let url = initialUrl;

    if (queryParams && Object.keys(queryParams).length) {
      url += `?${stringify(queryParams)}`;
    }

    this.loggerService.debug({
      message: 'Sending http request...',
      url,
      method,
      headers,
    });

    try {
      const response = await fetch(url, {
        method,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headers: headers as any,
        body,
      });

      const responseBodyText = await response.text();

      const responseBody = !responseBodyText.length ? {} : JSON.parse(responseBodyText);

      this.loggerService.debug({
        message: 'Http request sent.',
        response: {
          statusCode: response.status,
          body: response.status >= 200 && response.status < 300 ? 'hidden' : responseBody,
        },
      });

      return {
        body: responseBody as ResponseBody,
        statusCode: response.status,
      };
    } catch (error) {
      throw new HttpServiceError({
        method,
        url,
        originalError: error,
      });
    }
  }
}
