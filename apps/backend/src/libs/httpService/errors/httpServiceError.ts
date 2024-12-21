import { BaseError, type BaseErrorContext } from '../../errors/baseError.js';

interface Context extends BaseErrorContext {
  readonly url: string;
  readonly method: string;
}

export class HttpServiceError extends BaseError<Context> {
  public constructor(context: Context) {
    super('HttpServiceError', 'Http service error.', context);
  }
}
