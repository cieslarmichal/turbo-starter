import { type Static, Type } from '@sinclair/typebox';

import type { ResetUserPasswordRequestBody } from '@common/contracts';

import { emailSchema } from './userDto.js';
import { type TypeExtends } from '../../../../../../libs/types/schemaExtends.js';

export const resetUserPasswordBodyDtoSchema = Type.Object({
  email: emailSchema,
});

export type ResetUserPasswordBodyDto = TypeExtends<
  Static<typeof resetUserPasswordBodyDtoSchema>,
  ResetUserPasswordRequestBody
>;

export const resetUserPasswordResponseBodyDtoSchema = Type.Null();

export type ResetUserPasswordResponseBodyDto = Static<typeof resetUserPasswordResponseBodyDtoSchema>;
