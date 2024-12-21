import { type User } from './user.js';

export interface RegisterUserRequestBody {
  readonly email: string;
  readonly password: string;
  readonly name: string;
}

export type RegisterUserResponseBody = User;
