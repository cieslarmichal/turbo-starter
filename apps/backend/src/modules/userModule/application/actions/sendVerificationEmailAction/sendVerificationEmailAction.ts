import { type Action } from '../../../../../libs/types/action.js';

export interface ExecutePayload {
  readonly email: string;
}

export type SendVerificationEmailAction = Action<ExecutePayload, void>;
