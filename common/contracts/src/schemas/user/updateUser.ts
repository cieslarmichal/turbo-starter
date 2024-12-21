import { type User } from './user.js';

export interface UpdateUserPathParams {
  readonly userId: string;
}

export interface UpdateUserRequestBody {
  readonly name: string;
}

export type UpdateUserResponseBody = User;
