import { beforeEach, expect, describe, it } from 'vitest';

import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl.js';
import { authSymbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { TestContainer } from '../../../tests/testContainer.js';
import { AccessControlServiceImpl } from './application/services/accessControlService/accessControlServiceImpl.js';

describe('AuthModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = TestContainer.create();
  });

  it('declares bindings', async () => {
    expect(container.get(authSymbols.tokenService)).toBeInstanceOf(TokenServiceImpl);

    expect(container.get(authSymbols.accessControlService)).toBeInstanceOf(AccessControlServiceImpl);
  });
});
