import { UserRole } from '@common/contracts';

import {
  type RegisterUserAction,
  type RegisterUserActionPayload,
  type RegisterUserActionResult,
} from './registerUserAction.js';
import { ResourceAlreadyExistsError } from '../../../../../libs/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type HashService } from '../../services/hashService/hashService.js';
import { type PasswordValidationService } from '../../services/passwordValidationService/passwordValidationService.js';
import { type SendVerificationEmailAction } from '../sendVerificationEmailAction/sendVerificationEmailAction.js';

export class RegisterUserActionImpl implements RegisterUserAction {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly loggerService: LoggerService,
    private readonly passwordValidationService: PasswordValidationService,
    private readonly sendVerificationEmailAction: SendVerificationEmailAction,
  ) {}

  public async execute(payload: RegisterUserActionPayload): Promise<RegisterUserActionResult> {
    const { email: emailInput, password, name } = payload;

    const email = emailInput.toLowerCase();

    this.loggerService.debug({
      message: 'Registering User...',
      email,
      name,
    });

    const existingUser = await this.userRepository.findUser({ email });

    if (existingUser) {
      throw new ResourceAlreadyExistsError({
        resource: 'User',
        email,
      });
    }

    this.passwordValidationService.validate({ password });

    const hashedPassword = await this.hashService.hash({ plainData: password });

    const user = await this.userRepository.saveUser({
      user: {
        email,
        password: hashedPassword,
        name,
        isEmailVerified: false,
        isBlocked: false,
        role: UserRole.user,
      },
    });

    this.loggerService.debug({
      message: 'User registered.',
      email,
      userId: user.getId(),
    });

    await this.sendVerificationEmailAction.execute({ email });

    return { user };
  }
}
