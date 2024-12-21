import { type Action } from '../../../../../libs/types/action.js';

export interface DeleteUserActionPayload {
  readonly userId: string;
}

export type DeleteUserAction = Action<DeleteUserActionPayload, void>;
