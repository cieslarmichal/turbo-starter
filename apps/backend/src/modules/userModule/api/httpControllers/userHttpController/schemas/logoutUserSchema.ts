import { type Static, Type } from '@sinclair/typebox';

import type { LogoutUserPathParams, LogoutUserRequestBody } from '@common/contracts';

import { type TypeExtends } from '../../../../../../libs/types/schemaExtends.js';

export const logoutUserPathParamsDtoSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

export type LogoutUserPathParamsDto = TypeExtends<Static<typeof logoutUserPathParamsDtoSchema>, LogoutUserPathParams>;

export const logoutUserBodyDtoSchema = Type.Object({
  refreshToken: Type.String(),
  accessToken: Type.String(),
});

export type LogoutUserBodyDto = TypeExtends<Static<typeof logoutUserBodyDtoSchema>, LogoutUserRequestBody>;

export const logoutUserResponseBodyDtoSchema = Type.Null();

export type LogoutUserResponseBodyDto = Static<typeof logoutUserResponseBodyDtoSchema>;
