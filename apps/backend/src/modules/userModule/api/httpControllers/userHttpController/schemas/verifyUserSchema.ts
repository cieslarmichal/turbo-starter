import { type Static, Type } from '@sinclair/typebox';

import type { VerifyUserRequestBody } from '@common/contracts';

import { type TypeExtends } from '../../../../../../libs/types/schemaExtends.js';

export const verifyUserBodyDtoSchema = Type.Object({
  token: Type.String({ minLength: 1 }),
});

export type VerifyUserBodyDto = TypeExtends<Static<typeof verifyUserBodyDtoSchema>, VerifyUserRequestBody>;

export const verifyUserResponseBodyDtoSchema = Type.Null();

export type VerifyUserResponseBodyDto = Static<typeof verifyUserResponseBodyDtoSchema>;
