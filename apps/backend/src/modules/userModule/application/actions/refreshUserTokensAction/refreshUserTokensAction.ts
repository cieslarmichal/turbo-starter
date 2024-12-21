import { type Action } from '../../../../../libs/types/action.js';

export interface RefreshUserTokensActionPayload {
  readonly refreshToken: string;
}

export interface RefreshUserTokensActionResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresIn: number;
}

export type RefreshUserTokensAction = Action<RefreshUserTokensActionPayload, RefreshUserTokensActionResult>;
