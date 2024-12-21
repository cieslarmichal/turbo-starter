import { type Action } from '../../../../../libs/types/action.js';

export interface ExecutePayload {
  readonly userId: string;
  readonly refreshToken: string;
  readonly accessToken: string;
}

export type LogoutUserAction = Action<ExecutePayload, void>;
