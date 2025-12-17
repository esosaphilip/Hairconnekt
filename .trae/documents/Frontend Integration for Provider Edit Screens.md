# Frontend Integration Plan: Provider Profile Edit Screens

This plan connects the 5 provider edit screens in the mobile app to the backend endpoints I just created.

## 1. API Integration (`src/api/providerProfile.ts`)

I will update the `providerProfileApi` to include methods for the new specific endpoints.

*   **New Methods:**
    *   `updateBio(bio: string)` -> `PATCH /providers/profile/bio`
    *   `updateSpecializations(specs: string[])` -> `PUT /providers/profile/specializations`
    *   `updateLanguages(langs: string[])` -> `PUT /providers/profile/languages`
    *   `updateSocialMedia(social: SocialMediaLinks)` -> `PATCH /providers/profile/social-media`
    *   `getCertifications()` -> `GET /providers/profile/certifications`
    *   `addCertification(cert: CertData)` -> `POST /providers/profile/certifications`
    *   `removeCertification(id: string)` -> `DELETE /providers/profile/certifications/:id`

## 2. Screen Implementation Updates

I will modify each screen to fetch initial data on mount and call the update API on save.

### 2.1 `EditAboutMeScreen.tsx`
*   **Fetch:** Get current bio from `providersApi.getMyProfile()`.
*   **Save:** Call `providerProfileApi.updateBio(bio)`.
*   **Feedback:** Show success/error alert.

### 2.2 `EditSpecializationsScreen.tsx`
*   **Fetch:** Get current specializations from `providersApi.getMyProfile()` (which needs to include `specializations` array now, likely via relations).
*   **Save:** Call `providerProfileApi.updateSpecializations(selectedSpecs)`.
*   **Logic:** Ensure selected specs map correctly to the backend Enum values.

### 2.3 `EditLanguagesScreen.tsx`
*   **Fetch:** Get current languages from `providersApi.getMyProfile()`.
*   **Save:** Call `providerProfileApi.updateLanguages(selectedLangs)`.

### 2.4 `EditSocialMediaScreen.tsx`
*   **Fetch:** Get current links from `providersApi.getMyProfile()`.
*   **Save:** Call `providerProfileApi.updateSocialMedia(links)`.

### 2.5 `EditCertificationsScreen.tsx`
*   **Fetch:** Call `providerProfileApi.getCertifications()` on mount.
*   **Add:** Call `providerProfileApi.addCertification(...)` -> Update local list.
*   **Delete:** Call `providerProfileApi.removeCertification(...)` -> Update local list.

## 3. Data Flow & Types

*   Update `BackendProvider` type in `src/api/types.ts` (or wherever defined) to include the new fields (`bio`, `specializations`, `languages`, `certifications`, `socialMedia`).
*   Ensure `getMyProfile` endpoint in backend actually returns these relations. (I already updated `ProvidersService.getMyProfile` in backend to return sanitized provider, but need to double check if I included the new relations in the `relations: [...]` array of `findOne`. **Self-Correction:** I need to check backend `providers.service.ts` again. If I didn't add them to `relations` in `getMyProfile`, the frontend won't see them initially. I will verify this during implementation or add a small backend fix if needed, but primarily focusing on frontend integration here).

## 4. Execution Steps

1.  **Update API Client:** Add new methods to `src/api/providerProfile.ts`.
2.  **Update Screens:** iteratively update each of the 5 screens to use these API calls instead of dummy state.
3.  **Verify:** Ensure loading states and error handling are present.
