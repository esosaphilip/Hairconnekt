**Goal**

* Make ESLint consistently parse .ts/.tsx as TypeScript, stop JS-parser errors, and cut noisy warnings.

**Why ESLint complains**

* ESLint is JavaScript-first. To lint TypeScript it needs `@typescript-eslint/parser` and proper `parserOptions.project` pointing to the tsconfig.

* If ESLint or the editor uses a JS parser on TSX, you get errors like “import type… only in TypeScript files”.

**Plan**

* Mobile ESLint config:

  * Confirm/use `@typescript-eslint/parser` as the main parser.

  * Set `parserOptions.tsconfigRootDir=__dirname` and `parserOptions.project=['./tsconfig.json']`.

  * Add an override for `**/*.{ts,tsx}` with the same parser and `parserOptions.project`.

  * Keep recommended TypeScript rules (`plugin:@typescript-eslint/recommended`).

* Editor alignment:

  * Ensure VS Code uses workspace TypeScript and associates `*.tsx` with TypeScript React.

  * Restart TS server and ESLint server.

* Rule hygiene:

  * Demote or silence high-churn warnings for development (`no-explicit-any`, `no-unused-vars` to ‘warn’ in app code; keep ‘error’ for core dirs where needed).

  * Remove obvious unused imports/styles found by RN plugin to reduce noise.

**Deliverables**

* Updated `.eslintrc.cjs` in `apps/mobile` with project-aware TS parsing.

* Minimal cleanup in affected screens to remove unused items.

* Short README note (optional) on VS Code settings to use workspace TS and restart servers.

**Verification**

* Run `npm run typecheck` and `npm run lint` in `apps/mobile` to confirm TypeScript parsing works and warnings are limited to real issues.

