import { type UserRole } from '@common/contracts';

export interface UserDraft {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly isEmailVerified: boolean;
  readonly isDeleted: boolean;
  readonly role: UserRole;
}

export interface UserState {
  email: string;
  password: string;
  name: string;
  isEmailVerified: boolean;
  isDeleted: boolean;
  readonly role: UserRole;
}

export interface SetPasswordPayload {
  readonly password: string;
}

export interface SetEmailPayload {
  readonly email: string;
}

export interface SetIsEmailVerifiedPayload {
  readonly isEmailVerified: boolean;
}

export interface SetIsDeletedPayload {
  readonly isDeleted: boolean;
}

export interface SetNamePayload {
  readonly name: string;
}

export class User {
  private id: string;
  private state: UserState;

  public constructor(draft: UserDraft) {
    const { id, email, password, name, isEmailVerified, isDeleted, role } = draft;

    this.id = id;

    this.state = {
      email,
      password,
      name,
      isEmailVerified,
      isDeleted,
      role,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.state.email;
  }

  public getPassword(): string {
    return this.state.password;
  }

  public getName(): string {
    return this.state.name;
  }

  public getRole(): UserRole {
    return this.state.role;
  }

  public getIsEmailVerified(): boolean {
    return this.state.isEmailVerified;
  }

  public getIsDeleted(): boolean {
    return this.state.isDeleted;
  }

  public getState(): UserState {
    return this.state;
  }

  public setPassword(payload: SetPasswordPayload): void {
    const { password } = payload;

    this.state.password = password;
  }

  public setEmail(payload: SetEmailPayload): void {
    const { email } = payload;

    this.state.email = email;
  }

  public setIsEmailVerified(payload: SetIsEmailVerifiedPayload): void {
    const { isEmailVerified } = payload;

    this.state.isEmailVerified = isEmailVerified;
  }

  public setIsDeleted(payload: SetIsDeletedPayload): void {
    const { isDeleted } = payload;

    this.state.isDeleted = isDeleted;
  }

  public setName(payload: SetNamePayload): void {
    const { name } = payload;

    this.state.name = name;
  }
}
