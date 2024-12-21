import { BaseError, type BaseErrorContext } from './baseError.js';

interface Context extends BaseErrorContext {
  readonly resource: string;
  readonly [key: string]: unknown;
}

export class ResourceNotFoundError extends BaseError<Context> {
  public constructor(context: Context) {
    super('ResourceNotFoundError', 'Resource not found.', context);
  }
}
