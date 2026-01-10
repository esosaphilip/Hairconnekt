/**
 * ESLint configuration for the Hairconnekt web design app.
 * Ensures .ts/.tsx files are parsed with TypeScript-aware parser to avoid
 * false positives like "Type annotations can only be used in TypeScript files".
 */
module.exports = {
  root: true,
  // Ensure TypeScript syntax in .ts/.tsx is always understood by ESLint
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // IMPORTANT: Do NOT set `project` here so JS files aren't forced into the TS program.
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    // You can tune rules here as needed; keeping defaults minimal for now.
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    // Using TypeScript for props typing, so prop-types are not required
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    'capacitor.config.ts',
    'vite.config.ts',
    '.eslintrc.cjs',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
      // Use the default JS parser for plain JavaScript files
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
  ],
};