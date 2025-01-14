import { type UserState, type User } from '../../../domain/entities/user/user.js';

export interface SaveUserPayload {
  readonly user: UserState | User;
}

export interface FindUserPayload {
  readonly id?: string;
  readonly email?: string;
}

export interface FindUsersPayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface UserRepository {
  saveUser(input: SaveUserPayload): Promise<User>;
  findUser(input: FindUserPayload): Promise<User | null>;
  findUsers(payload: FindUsersPayload): Promise<User[]>;
  countUsers(): Promise<number>;
}
