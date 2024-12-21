import { type Static } from '@sinclair/typebox';

import type { FindMyUserResponseBody } from '@common/contracts';

import { userDtoSchema } from './userDto.js';
import { type TypeExtends } from '../../../../../../libs/types/schemaExtends.js';

export const findMyUserResponseBodyDtoSchema = userDtoSchema;

export type FindMyUserResponseBodyDto = TypeExtends<
  Static<typeof findMyUserResponseBodyDtoSchema>,
  FindMyUserResponseBody
>;
