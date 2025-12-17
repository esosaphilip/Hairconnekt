# Fix Backend Build Error & Deploy

## Problem
The backend deployment failed with a TypeScript error:
`error TS2349: This expression is not callable. Type 'typeof sanitize' has no call signatures.`

This is happening because `sanitize-html` is imported as `import * as sanitizeHtml from 'sanitize-html'`, but the library exports a default function.

## Solution
1.  **Fix Import:** Change the import statement in `src/modules/providers/providers.service.ts` to use `import sanitizeHtml from 'sanitize-html';` (or `import sanitizeHtml = require('sanitize-html')` if using CommonJS interop, but `esModuleInterop` is usually on in NestJS).
    *   Given the error `Type originates at this import. A namespace-style import cannot be called`, changing to default import is the correct fix.

2.  **Verify & Push:**
    *   Apply the fix.
    *   Commit and push to trigger a new deployment.

## Execution Plan
1.  Modify `backend/src/modules/providers/providers.service.ts`.
2.  Git add, commit, push.
