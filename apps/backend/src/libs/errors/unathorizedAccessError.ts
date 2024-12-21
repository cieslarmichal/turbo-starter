import { type BaseErrorContext, BaseError } from './baseError.js';

interface Context extends BaseErrorContext {
  readonly reason: string;
}

export class UnauthorizedAccessError extends BaseError<Context> {
  public constructor(context: Context) {
    super('UnauthorizedAccessError', 'Not authorized to perform this action.', context);
  }
}
