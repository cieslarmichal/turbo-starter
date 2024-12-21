import { type Action } from '../../../../../libs/types/action.js';
import { type User } from '../../../domain/entities/user/user.js';

export interface FindUserActionPayload {
  readonly userId: string;
}

export interface FindUserActionResult {
  readonly user: User;
}

export type FindUserAction = Action<FindUserActionPayload, FindUserActionResult>;
