import { type Static, Type } from '@sinclair/typebox';

import type { LoginUserRequestBody, LoginUserResponseBody } from '@common/contracts';

import { emailSchema, passwordSchema } from './userDto.js';
import { type TypeExtends } from '../../../../../../libs/types/schemaExtends.js';

export const loginUserBodyDtoSchema = Type.Object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginUserBodyDto = TypeExtends<Static<typeof loginUserBodyDtoSchema>, LoginUserRequestBody>;

export const loginUserResponseBodyDtoSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.Number(),
});

export type LoginUserResponseBodyDto = TypeExtends<
  Static<typeof loginUserResponseBodyDtoSchema>,
  LoginUserResponseBody
>;
