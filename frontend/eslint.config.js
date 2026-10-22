import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-console': ['warn', { allow: ['error'] }],
    },
  },
  {
    // shared/ must stay independent from app/ and modules/
    files: ['src/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/*', '@/app/*'],
              message: 'shared/ không được import app/ hoặc modules/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/mock/*'], message: 'src/ không được import từ mock/.' }] },
      ],
    },
  },
  {
    files: ['mock/**/*.mjs', 'tests/**/*.{mjs,jsx}', 'vite.config.js'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },
]);
