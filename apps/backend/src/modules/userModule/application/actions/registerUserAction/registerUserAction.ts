import { type Action } from '../../../../../libs/types/action.js';
import { type User } from '../../../domain/entities/user/user.js';

export interface RegisterUserActionPayload {
  readonly email: string;
  readonly password: string;
  readonly name: string;
}

export interface RegisterUserActionResult {
  readonly user: User;
}

export type RegisterUserAction = Action<RegisterUserActionPayload, RegisterUserActionResult>;
