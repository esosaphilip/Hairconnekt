I will modify `backend/src/database/migrations/1765953245960-AddProviderProfileFeatures.ts` to resolve the `QueryFailedError` regarding the `price_type` default value casting.

**Plan:**
1.  **Update `up` method:**
    *   Before altering `services.price_type` to the new ENUM, explicitly **drop the existing default constraint**.
    *   Perform the `ALTER COLUMN ... TYPE ... USING ...` (already present).
    *   **Re-apply the default value** ('FIXED') cast to the new ENUM type.

2.  **Update `down` method:**
    *   Replace the destructive `DROP COLUMN` / `ADD COLUMN` pattern with a safe `ALTER COLUMN` approach to preserve data during rollback.
    *   Drop the ENUM default.
    *   Convert the column back to `character varying(20)`.
    *   Drop the ENUM type.
    *   Restore the original default value ('FIXED').

This ensures the migration handles the type transition correctly without violating PostgreSQL's strict type casting rules for default values.