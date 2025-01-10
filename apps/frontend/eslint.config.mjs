import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import/no-named-as-default': 'off',
      'import/no-unresolved': 'off',
      'import/default': 'off',
      'import/namespace': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
];
