import { type Action } from '../../../../../libs/types/action.js';

export interface ExecutePayload {
  readonly emailVerificationToken: string;
}

export type VerifyUserEmailAction = Action<ExecutePayload, void>;
