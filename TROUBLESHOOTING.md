# HairConnekt Troubleshooting & Debugging Guide

This document maintains a record of common problems, their root causes, and solutions encountered during the development of HairConnekt. Use this as a first reference when encountering similar issues.

## 🚨 Backend Deployment Failures (Render)

### Problem: "Nest can't resolve dependencies..."
**Error Message:**
`Nest can't resolve dependencies of the AvailabilityService (AvailabilityRepository, AvailabilitySlotRepository, ?). Please make sure that the argument "ProviderProfileRepository" at index [2] is available in the AvailabilityModule context.`

**Root Cause:**
A Service (e.g., `AvailabilityService`) injects a Repository (e.g., `ProviderProfile`), but the Module (e.g., `AvailabilityModule`) does not import that Entity in `TypeOrmModule.forFeature()`.

**Solution:**
1. Open the relevant Module file (e.g., `availability.module.ts`).
2. Add the missing Entity to the imports:
   ```typescript
   imports: [TypeOrmModule.forFeature([Availability, AvailabilitySlot, ProviderProfile])]
   ```

### Problem: Build Failed due to Type Errors
**Error Message:**
`Property 'availabilities' does not exist on type 'ProviderProfile'.`

**Root Cause:**
A circular dependency or mismatch in TypeORM relation definitions. One entity tries to map to a property on the other entity that doesn't exist or is named differently.

**Solution:**
1. Check both Entity files.
2. If the inverse relation isn't strictly necessary, make the relation **Unidirectional** (remove the second argument in the decorator):
   ```typescript
   // Before (Broken)
   @ManyToOne(() => ProviderProfile, (p) => p.availabilities)
   
   // After (Fixed)
   @ManyToOne(() => ProviderProfile)
   ```

---

## ⚡ API & Runtime Errors (500 Internal Server Error)

### Problem: Service Creation Fails (500 Error)
**Symptoms:**
* Frontend receives `500 Internal Server Error`.
* Render logs show `QueryFailedError` or `Relation "user" does not exist`.

**Root Cause:**
Using `QueryBuilder` incorrectly for relation lookups, especially when trying to join tables manually without proper aliases.

**Solution:**
Refactor to use the standard `findOne` method with the `where` option, which handles relations safely:
```typescript
// BAD (QueryBuilder risk)
// .where('profile.user = :userId', { userId })

// GOOD (TypeORM Standard)
const provider = await this.providerProfileRepository.findOne({
  where: { user: { id: userId } }
});
```

---

## 📱 Mobile App UI Glitches

### Problem: "1 then 0" State Snap-back
**Symptoms:**
* User creates an item (e.g., a Service).
* UI shows the new item count (e.g., "1 Service") for a split second.
* UI immediately reverts to "0 Services" and shows an error snackbar.

**Root Cause:**
**Optimistic Updates** in the frontend hook. The UI updates local state *before* the server responds. When the server returns an error (500), the UI reverts the change.

**Solution:**
1. Fix the underlying Backend 500 error first.
2. Temporarily **disable optimistic updates** in the hook (`useServices.ts`) to make debugging easier. Wait for the `await apiCall()` to succeed before updating the state.

### Problem: Crash on Search Screen
**Error Message:**
`ReferenceError: http is not defined`

**Root Cause:**
Using a global variable or imported module (like `http`) without importing it at the top of the file.

**Solution:**
Ensure all API clients are imported:
```typescript
import { http } from '@/api/http';
```

---

## 🛠 General Debugging Checklist

1. **Check Render Logs:** Always look at the server logs first. They contain the specific SQL error or stack trace.
2. **Verify Entity Sync:** Ensure your TypeORM Entities match your Database Schema. If you added a column (`allowOnlineBooking`) in code, make sure it exists in the DB (run migrations).
3. **Explicit IDs:** In Controllers, explicitly resolve IDs (e.g., `userId` -> `providerId`) before passing them to Services. Do not rely on implicit context if it's failing.
4. **Clean State:** If the app behaves weirdly after an update, clear the app data or reinstall to remove stale cached JS bundles.
