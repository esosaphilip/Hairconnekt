/**
 * Local ESLint config for the Expo mobile app to properly parse TypeScript/TSX.
 * Fixes diagnostics like "import type declarations can only be used in TypeScript files"
 * and "interface declarations can only be used in TypeScript files" by using
 * the TypeScript ESLint parser for .ts/.tsx files.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // Not using project-based type-aware linting to keep it light; can be enabled later:
    // project: './tsconfig.json',
  },
  env: { browser: true, node: true, es6: true },
  settings: { react: { version: 'detect' } },
  plugins: ['@typescript-eslint', 'react', 'react-native'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
    },
    {
      files: ['src/api/**/*.{ts,tsx}', 'src/auth/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
      },
    },
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-single-element-style-arrays': 'error',
    'react-native/sort-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-inline-styles': 'off',
    'react-native/no-raw-text': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'typecheck.out',
    'assets/',
    'docs/',
    'guildlines/',
    '**/*.md',
  ],
};
