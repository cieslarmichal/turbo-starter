import { type BaseErrorContext, BaseError } from './baseError.js';

interface Context extends BaseErrorContext {
  readonly reason: string;
}

export class ForbiddenAccessError extends BaseError<Context> {
  public constructor(context: Context) {
    super('ForbiddenAccessError', 'No permissions to perform this action.', context);
  }
}
