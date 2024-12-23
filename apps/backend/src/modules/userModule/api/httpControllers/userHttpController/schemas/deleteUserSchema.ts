import { Type, type Static } from '@sinclair/typebox';

import type { DeleteUserPathParams } from '@common/contracts';

import { type TypeExtends } from '../../../../../../libs/types/schemaExtends.js';

export const deleteUserPathParamsDtoSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

export type DeleteUserPathParamsDto = TypeExtends<Static<typeof deleteUserPathParamsDtoSchema>, DeleteUserPathParams>;

export const deleteUserResponseBodyDtoSchema = Type.Null();

export type DeleteUserResponseBodyDto = Static<typeof deleteUserResponseBodyDtoSchema>;
