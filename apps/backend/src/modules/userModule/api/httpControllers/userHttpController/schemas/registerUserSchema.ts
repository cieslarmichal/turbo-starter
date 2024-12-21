/* eslint-disable @typescript-eslint/naming-convention */

import { type Static, Type } from '@sinclair/typebox';
import { type FastifyRequest } from 'fastify';

import type { RegisterUserRequestBody, RegisterUserResponseBody } from '@common/contracts';

import { emailSchema, passwordSchema, userDtoSchema, userNameSchema } from './userDto.js';
import { InputNotValidError } from '../../../../../../libs/errors/inputNotValidError.js';
import { type TypeExtends } from '../../../../../../libs/types/schemaExtends.js';

export const registerUserRequestBodyDtoSchema = Type.Object({
  email: emailSchema,
  password: passwordSchema,
  name: userNameSchema,
});

export type RegisterUserRequestBodyDto = TypeExtends<
  Static<typeof registerUserRequestBodyDtoSchema>,
  RegisterUserRequestBody
>;

export const registerUserResponseBodyDtoSchema = userDtoSchema;

export type RegisterUserResponseBodyDto = TypeExtends<
  Static<typeof registerUserResponseBodyDtoSchema>,
  RegisterUserResponseBody
>;

export const registerUserBodyPreValidationHook = (
  request: FastifyRequest<{ Body: RegisterUserRequestBodyDto }>,
): void => {
  const { name } = request.body;

  const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/g;

  if (specialCharacterRegex.test(name)) {
    throw new InputNotValidError({
      reason: 'body/name must NOT contain special characters',
      value: name,
    });
  }
};
