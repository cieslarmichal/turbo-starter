import {
  type ChangeUserPasswordBodyDto,
  type ChangeUserPasswordResponseBodyDto,
  changeUserPasswordBodyDtoSchema,
  changeUserPasswordResponseBodyDtoSchema,
} from './schemas/changeUserPasswordSchema.js';
import {
  deleteUserResponseBodyDtoSchema,
  type DeleteUserResponseBodyDto,
  type DeleteUserPathParamsDto,
  deleteUserPathParamsDtoSchema,
} from './schemas/deleteUserSchema.js';
import { type FindMyUserResponseBodyDto, findMyUserResponseBodyDtoSchema } from './schemas/findMyUserSchema.js';
import {
  type LoginUserBodyDto,
  type LoginUserResponseBodyDto,
  loginUserBodyDtoSchema,
  loginUserResponseBodyDtoSchema,
} from './schemas/loginUserSchema.js';
import {
  logoutUserPathParamsDtoSchema,
  type LogoutUserBodyDto,
  type LogoutUserPathParamsDto,
  type LogoutUserResponseBodyDto,
  logoutUserBodyDtoSchema,
  logoutUserResponseBodyDtoSchema,
} from './schemas/logoutUserSchema.js';
import {
  refreshUserTokensBodyDtoSchema,
  refreshUserTokensResponseBodyDtoSchema,
  type RefreshUserTokensBodyDto,
  type RefreshUserTokensResponseBodyDto,
} from './schemas/refreshUserTokensSchema.js';
import {
  registerUserRequestBodyDtoSchema,
  registerUserResponseBodyDtoSchema,
  type RegisterUserResponseBodyDto,
  type RegisterUserRequestBodyDto,
  registerUserBodyPreValidationHook,
} from './schemas/registerUserSchema.js';
import {
  type ResetUserPasswordBodyDto,
  type ResetUserPasswordResponseBodyDto,
  resetUserPasswordBodyDtoSchema,
  resetUserPasswordResponseBodyDtoSchema,
} from './schemas/resetUserPasswordSchema.js';
import {
  type SendVerificationEmailBodyDto,
  type SendVerificationEmailResponseBodyDto,
  sendVerificationEmailBodyDtoSchema,
  sendVerificationEmailResponseBodyDtoSchema,
} from './schemas/sendVerificationEmailSchema.js';
import {
  type UpdateUserResponseBodyDto,
  type UpdateUserPathParamsDto,
  type UpdateUserRequestBodyDto,
  updateUserPathParamsDtoSchema,
  updateUserRequestBodyDtoSchema,
  updateUserResponseBodyDtoSchema,
} from './schemas/updateUserSchema.js';
import { type UserDto } from './schemas/userDto.js';
import {
  verifyUserBodyDtoSchema,
  verifyUserResponseBodyDtoSchema,
  type VerifyUserBodyDto,
  type VerifyUserResponseBodyDto,
} from './schemas/verifyUserSchema.js';
import { OperationNotValidError } from '../../../../../libs/errors/operationNotValidError.js';
import { type HttpController } from '../../../../../libs/http/httpController.js';
import { HttpMethodName } from '../../../../../libs/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../libs/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpOkResponse,
  type HttpNoContentResponse,
} from '../../../../../libs/http/httpResponse.js';
import { HttpRoute } from '../../../../../libs/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../libs/http/httpStatusCode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type ChangeUserPasswordAction } from '../../../application/actions/changeUserPasswordAction/changeUserPasswordAction.js';
import { type DeleteUserAction } from '../../../application/actions/deleteUserAction/deleteUserAction.js';
import { type FindUserAction } from '../../../application/actions/findUserAction/findUserAction.js';
import { type LoginUserAction } from '../../../application/actions/loginUserAction/loginUserAction.js';
import { type LogoutUserAction } from '../../../application/actions/logoutUserAction/logoutUserAction.js';
import { type RefreshUserTokensAction } from '../../../application/actions/refreshUserTokensAction/refreshUserTokensAction.js';
import { type RegisterUserAction } from '../../../application/actions/registerUserAction/registerUserAction.js';
import { type SendResetPasswordEmailAction } from '../../../application/actions/sendResetPasswordEmailAction/sendResetPasswordEmailAction.js';
import { type SendVerificationEmailAction } from '../../../application/actions/sendVerificationEmailAction/sendVerificationEmailAction.js';
import { type UpdateUserAction } from '../../../application/actions/updateUserAction/updateUserAction.js';
import { type VerifyUserEmailAction } from '../../../application/actions/verifyUserEmailAction/verifyUserEmailAction.js';
import { type User } from '../../../domain/entities/user/user.js';

export class UserHttpController implements HttpController {
  public readonly basePath = '/users';
  public readonly tags = ['User'];

  public constructor(
    private readonly registerUserAction: RegisterUserAction,
    private readonly loginUserAction: LoginUserAction,
    private readonly deleteUserAction: DeleteUserAction,
    private readonly updateUserAction: UpdateUserAction,
    private readonly findUserAction: FindUserAction,
    private readonly accessControlService: AccessControlService,
    private readonly verifyUserEmailAction: VerifyUserEmailAction,
    private readonly resetUserPasswordAction: SendResetPasswordEmailAction,
    private readonly changeUserPasswordAction: ChangeUserPasswordAction,
    private readonly logoutUserAction: LogoutUserAction,
    private readonly refreshUserTokensAction: RefreshUserTokensAction,
    private readonly sendVerificationEmailAction: SendVerificationEmailAction,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'register',
        handler: this.registerUser.bind(this),
        schema: {
          request: {
            body: registerUserRequestBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: registerUserResponseBodyDtoSchema,
              description: 'User registered',
            },
          },
        },
        preValidation: registerUserBodyPreValidationHook,
        description: 'Register user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'login',
        handler: this.loginUser.bind(this),
        schema: {
          request: {
            body: loginUserBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: loginUserResponseBodyDtoSchema,
              description: 'User logged in',
            },
          },
        },
        description: 'Login user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'reset-password',
        handler: this.resetUserPassword.bind(this),
        description: 'Reset user password',
        schema: {
          request: {
            body: resetUserPasswordBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: resetUserPasswordResponseBodyDtoSchema,
              description: 'User password reset',
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'change-password',
        description: 'Change user password',
        handler: this.changeUserPassword.bind(this),
        schema: {
          request: {
            body: changeUserPasswordBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: changeUserPasswordResponseBodyDtoSchema,
              description: 'User password changed',
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: 'me',
        handler: this.findMyUser.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              schema: findMyUserResponseBodyDtoSchema,
              description: 'User found',
            },
          },
        },
        description: 'Find user by token',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':userId',
        handler: this.deleteUser.bind(this),
        schema: {
          request: {
            pathParams: deleteUserPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserResponseBodyDtoSchema,
              description: 'User deleted',
            },
          },
        },
        description: 'Delete user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'send-verification-email',
        handler: this.sendVerificationEmail.bind(this),
        schema: {
          request: {
            body: sendVerificationEmailBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: sendVerificationEmailResponseBodyDtoSchema,
              description: 'Verification email sent',
            },
          },
        },
        description: 'Send verification email',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'verify-email',
        handler: this.verifyUserEmail.bind(this),
        schema: {
          request: {
            body: verifyUserBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: verifyUserResponseBodyDtoSchema,
              description: "User's email verified",
            },
          },
        },
        description: 'Verify user email',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':userId/logout',
        handler: this.logoutUser.bind(this),
        schema: {
          request: {
            pathParams: logoutUserPathParamsDtoSchema,
            body: logoutUserBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: logoutUserResponseBodyDtoSchema,
              description: 'User logged out',
            },
          },
        },
        description: 'Logout user',
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':userId',
        handler: this.updateUser.bind(this),
        schema: {
          request: {
            pathParams: updateUserPathParamsDtoSchema,
            body: updateUserRequestBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: updateUserResponseBodyDtoSchema,
              description: 'User updated',
            },
          },
        },
        description: 'Update user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'token',
        handler: this.refreshUserTokens.bind(this),
        schema: {
          request: {
            body: refreshUserTokensBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: refreshUserTokensResponseBodyDtoSchema,
              description: 'User tokens refreshed',
            },
          },
        },
        description: 'Refresh user tokens',
      }),
    ];
  }

  private async registerUser(
    request: HttpRequest<RegisterUserRequestBodyDto>,
  ): Promise<HttpCreatedResponse<RegisterUserResponseBodyDto>> {
    const { email, password, name } = request.body;

    const { user } = await this.registerUserAction.execute({
      email,
      password,
      name,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapUserToUserDto(user),
    };
  }

  private async loginUser(request: HttpRequest<LoginUserBodyDto>): Promise<HttpOkResponse<LoginUserResponseBodyDto>> {
    const { email, password } = request.body;

    const { accessToken, refreshToken, accessTokenExpiresIn } = await this.loginUserAction.execute({
      email,
      password,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiresIn,
      },
    };
  }

  private async resetUserPassword(
    request: HttpRequest<ResetUserPasswordBodyDto, null, null>,
  ): Promise<HttpOkResponse<ResetUserPasswordResponseBodyDto>> {
    const { email } = request.body;

    await this.resetUserPasswordAction.execute({
      email,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async changeUserPassword(
    request: HttpRequest<ChangeUserPasswordBodyDto, null, null>,
  ): Promise<HttpOkResponse<ChangeUserPasswordResponseBodyDto>> {
    const { password, token } = request.body;

    let userId: string | undefined;

    try {
      const result = await this.accessControlService.verifyBearerToken({ requestHeaders: request.headers });

      userId = result.userId;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      userId = undefined;
    }

    let identifier: { userId: string } | { resetPasswordToken: string };

    if (userId) {
      identifier = { userId };
    } else {
      if (!token) {
        throw new OperationNotValidError({
          reason: 'Reset password token is required.',
        });
      }

      identifier = { resetPasswordToken: token };
    }

    await this.changeUserPasswordAction.execute({
      newPassword: password,
      identifier,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async findMyUser(request: HttpRequest): Promise<HttpOkResponse<FindMyUserResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({ requestHeaders: request.headers });

    const { user } = await this.findUserAction.execute({ userId });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserToUserDto(user),
    };
  }

  private async deleteUser(
    request: HttpRequest<undefined, undefined, DeleteUserPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedUserId: userId,
    });

    await this.deleteUserAction.execute({ userId });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private async updateUser(
    request: HttpRequest<UpdateUserRequestBodyDto, undefined, UpdateUserPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    const { name } = request.body;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedUserId: userId,
    });

    const { user } = await this.updateUserAction.execute({
      id: userId,
      name,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserToUserDto(user),
    };
  }

  private async verifyUserEmail(
    request: HttpRequest<VerifyUserBodyDto, undefined, undefined>,
  ): Promise<HttpOkResponse<VerifyUserResponseBodyDto>> {
    const { token } = request.body;

    await this.verifyUserEmailAction.execute({ emailVerificationToken: token });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async sendVerificationEmail(
    request: HttpRequest<SendVerificationEmailBodyDto, undefined, undefined>,
  ): Promise<HttpOkResponse<SendVerificationEmailResponseBodyDto>> {
    const { email } = request.body;

    await this.sendVerificationEmailAction.execute({
      email: email.toLowerCase(),
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async logoutUser(
    request: HttpRequest<LogoutUserBodyDto, undefined, LogoutUserPathParamsDto>,
  ): Promise<HttpOkResponse<LogoutUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    const { refreshToken, accessToken } = request.body;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedUserId: userId,
    });

    await this.logoutUserAction.execute({
      userId,
      refreshToken,
      accessToken,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async refreshUserTokens(
    request: HttpRequest<RefreshUserTokensBodyDto>,
  ): Promise<HttpOkResponse<RefreshUserTokensResponseBodyDto>> {
    const { refreshToken: inputRefreshToken } = request.body;

    const { accessToken, refreshToken, accessTokenExpiresIn } = await this.refreshUserTokensAction.execute({
      refreshToken: inputRefreshToken,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiresIn,
      },
    };
  }

  private mapUserToUserDto(user: User): UserDto {
    return {
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
      isEmailVerified: user.getIsEmailVerified(),
      isDeleted: user.getIsDeleted(),
      role: user.getRole(),
    };
  }
}
