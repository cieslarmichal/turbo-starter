import { type Action } from '../../../../../libs/types/action.js';

export interface LoginUserActionPayload {
  readonly email: string;
  readonly password: string;
}

export interface LoginUserActionResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresIn: number;
}

export type LoginUserAction = Action<LoginUserActionPayload, LoginUserActionResult>;
