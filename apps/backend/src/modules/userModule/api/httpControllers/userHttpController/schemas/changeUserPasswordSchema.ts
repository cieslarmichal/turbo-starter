import { type Static, Type } from '@sinclair/typebox';

import type { ChangeUserPasswordRequestBody } from '@common/contracts';

import { passwordSchema } from './userDto.js';
import { type TypeExtends } from '../../../../../../libs/types/schemaExtends.js';

export const changeUserPasswordBodyDtoSchema = Type.Object({
  password: passwordSchema,
  token: Type.Optional(Type.String({ minLength: 1 })),
});

export type ChangeUserPasswordBodyDto = TypeExtends<
  Static<typeof changeUserPasswordBodyDtoSchema>,
  ChangeUserPasswordRequestBody
>;

export const changeUserPasswordResponseBodyDtoSchema = Type.Null();

export type ChangeUserPasswordResponseBodyDto = Static<typeof changeUserPasswordResponseBodyDtoSchema>;
