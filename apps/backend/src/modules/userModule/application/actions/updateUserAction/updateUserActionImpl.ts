import {
  type UpdateUserActionResult,
  type UpdateUserAction,
  type UpdateUserActionPayload,
} from './updateUserAction.js';
import { OperationNotValidError } from '../../../../../libs/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class UpdateUserActionImpl implements UpdateUserAction {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateUserActionPayload): Promise<UpdateUserActionResult> {
    const { id, name } = payload;

    this.loggerService.debug({
      message: 'Updating user...',
      id,
      name,
    });

    const user = await this.userRepository.findUser({ id });

    if (!user) {
      throw new OperationNotValidError({
        reason: 'User not found.',
        userId: id,
      });
    }

    user.setName({ name });

    await this.userRepository.saveUser({ user });

    return { user };
  }
}
