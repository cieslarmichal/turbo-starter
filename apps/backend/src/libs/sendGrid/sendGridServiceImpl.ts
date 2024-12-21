import { type SendEmailPayload, type SendGridService } from './sendGridService.js';
import { HttpHeader } from '../http/httpHeader.js';
import { HttpMediaType } from '../http/httpMediaType.js';
import { HttpMethodName } from '../http/httpMethodName.js';
import { type HttpService } from '../httpService/httpService.js';

export interface SendGridConfig {
  readonly apiKey: string;
  readonly senderEmail: string;
}

export class SendGridServiceImpl implements SendGridService {
  public constructor(
    private readonly httpService: HttpService,
    private readonly config: SendGridConfig,
  ) {}

  public async sendEmail(payload: SendEmailPayload): Promise<void> {
    const { toEmail, subject, body } = payload;

    const { apiKey, senderEmail } = this.config;

    const url = 'https://api.sendgrid.com/v3/mail/send';

    const requestBody = {
      personalizations: [
        {
          to: [
            {
              email: toEmail,
            },
          ],
        },
      ],
      from: {
        email: senderEmail,
      },
      subject,
      content: [
        {
          type: HttpMediaType.textHtml,
          value: body,
        },
      ],
    };

    const requestHeaders = {
      [HttpHeader.authorization]: `Bearer ${apiKey}`,
      [HttpHeader.contentType]: HttpMediaType.applicationJson,
    };

    await this.httpService.sendRequest({
      method: HttpMethodName.post,
      url,
      body: requestBody,
      headers: requestHeaders,
    });
  }
}
