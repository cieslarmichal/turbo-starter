import { UserRole } from '../../../../../../../../common/contracts/dist/src/schemas/user/userRole.js';
import { Generator } from '../../../../../../tests/generator.js';
import { User, type UserDraft } from '../../../domain/entities/user/user.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';

export class UserTestFactory {
  public create(input: Partial<UserDraft> = {}): User {
    return new User({
      id: Generator.uuid(),
      email: Generator.email(),
      password: Generator.password(),
      name: Generator.fullName(),
      isEmailVerified: Generator.boolean(),
      isDeleted: false,
      role: UserRole.user,
      ...input,
    });
  }

  public createRaw(input: Partial<UserRawEntity> = {}): UserRawEntity {
    return {
      id: Generator.uuid(),
      email: Generator.email(),
      password: Generator.password(),
      name: Generator.fullName(),
      isEmailVerified: Generator.boolean(),
      isDeleted: false,
      role: UserRole.user,
      ...input,
    };
  }
}
