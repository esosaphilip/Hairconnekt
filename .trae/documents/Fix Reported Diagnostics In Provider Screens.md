## Scope
- ProviderDashboard.tsx: missing styles (`flex1`, `ghostButtonWide`), remove unused `useNavigation`.
- ProviderPublicProfileScreen.tsx: delete unused styles, remove `any`/unused vars in catches/mappers, add safe typing for portfolio/favorites.
- ProviderEarnings.tsx: remove unused inline icon components, replace `catch (e)` with `catch {}`.
- ProviderMore.tsx: surface `loadingProfile`, `profileError`, `earningsError` in UI to avoid unused-state warnings; keep types safe.
- ProviderProfileScreen.tsx: remove unused `radii` import; replace `any` with specific types where practical; update catches.
- ProviderSettingsScreen.tsx: remove `any` generic from `useNavigation`.

## Implementation Steps
1. ProviderDashboard.tsx
- Define `flex1: { flex:1 }` and `ghostButtonWide: { flex:1 }` in `styles`.
- Remove `useNavigation` import since `rootNavigationRef` is used.

2. ProviderPublicProfileScreen.tsx
- Delete the unused style keys: `openText`, `hoursList`, `hoursRow`, `hoursDay`, `hoursTimeOpen`, `hoursTimeClosed`, `reviewCard`, `reviewHeader`, `reviewClient`, `reviewDate`, `reviewServiceBadge`, `reviewText`, `starRow`.
- Change `catch (err: any)` → `catch { ... }` where error isn’t used (e.g., favorite toggle, loaders). Where error messages are read, use `unknown` and narrow.
- Replace `(it: any)` in portfolio mapping with a `RawPortfolioItem` type.
- Replace `(res as any)?.isFavorite` with a guarded read: `(res as { isFavorite?: boolean })?.isFavorite === true`.

3. ProviderEarnings.tsx
- Remove `Calendar`, `CreditCard`, `Euro` placeholder components since unused.
- Change `catch (e)` → `catch {}` in `navigate` helper.

4. ProviderMore.tsx
- Render a simple loading indicator when `loadingProfile` is true and an error text/card when `profileError` or `earningsError` are set, clearing unused-state warnings.
- Keep `profile` typed as `Record<string, unknown> | null` for now, avoiding `any`.

5. ProviderProfileScreen.tsx
- Remove unused `radii` import from tokens.
- Type `profile` state as `ProviderProfile | null`.
- Change `catch (e: any)` blocks to `catch (e: unknown)` and narrow when reading message.

6. ProviderSettingsScreen.tsx
- Change `useNavigation<any>()` to `useNavigation()` with inferred types.

## Verification
- Run lint on the touched files to confirm errors are cleared.
- Ensure UI remains unchanged functionally; only style key fixes and safe typing adjustments.

## Notes
- All changes are confined to provider screens; no API or navigation changes.
- Style deletions remove dead code; if future features need those, we can reintroduce them with usage.