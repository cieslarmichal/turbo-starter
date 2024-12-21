import { type Action } from '../../../../../libs/types/action.js';

export interface ChangeUserPasswordActionPayload {
  readonly newPassword: string;
  readonly identifier:
    | {
        readonly resetPasswordToken: string;
      }
    | {
        readonly userId: string;
      };
}

export type ChangeUserPasswordAction = Action<ChangeUserPasswordActionPayload, void>;
