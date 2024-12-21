import { type FindUserAction, type FindUserActionPayload, type FindUserActionResult } from './findUserAction.js';
import { ResourceNotFoundError } from '../../../../../libs/errors/resourceNotFoundError.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUserActionImpl implements FindUserAction {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(payload: FindUserActionPayload): Promise<FindUserActionResult> {
    const { userId } = payload;

    const user = await this.userRepository.findUser({ id: userId });

    if (!user) {
      throw new ResourceNotFoundError({
        resource: 'User',
        id: userId,
      });
    }

    return { user };
  }
}
