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
  ],
  rules: {
    // You can tune rules here. Keeping defaults for now.
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'typecheck.out',
  ],
};