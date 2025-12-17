# Backend Implementation Plan: Provider Profile Features

This plan outlines the steps to implement the 5 new provider profile screens in the NestJS backend, ensuring modularity, security, and correct data handling as requested.

## 1. Data Layer (Entities & Migrations)

We need to extend the `ProviderProfile` entity and create new related entities.

### 1.1 Update `ProviderProfile` Entity
*   **File:** `src/modules/providers/entities/provider-profile.entity.ts`
*   **Changes:**
    *   Add `website`, `instagram`, `facebook`, `twitter`, `youtube`, `linkedin` (nullable varchar columns).
    *   Ensure `bio` exists and is type `text`.

### 1.2 Create New Entities
*   **SpecializationEntity:**
    *   **File:** `src/modules/providers/entities/provider-specialization.entity.ts`
    *   **Fields:** `id` (uuid), `providerId` (FK), `specialization` (enum/string).
    *   **Index:** Unique composite index on `(providerId, specialization)`.
*   **LanguageEntity:**
    *   **File:** `src/modules/providers/entities/provider-language.entity.ts`
    *   **Fields:** `id` (uuid), `providerId` (FK), `language` (enum/string).
    *   **Index:** Unique composite index on `(providerId, language)`.
*   **CertificationEntity:**
    *   **File:** `src/modules/providers/entities/provider-certification.entity.ts`
    *   **Fields:** `id` (uuid), `providerId` (FK), `title` (string), `institution` (string), `year` (string, 4 chars).

### 1.3 Migrations
*   Generate a new TypeORM migration to apply these schema changes.
    *   `npm run typeorm migration:generate -- -n AddProviderProfileFeatures`

## 2. DTOs (Data Transfer Objects)

Create DTOs with `class-validator` decorators and German error messages.

*   **Location:** `src/modules/providers/dto/`
*   **Files:**
    *   `update-bio.dto.ts`: Validates `bio` (max 500 chars).
    *   `update-specializations.dto.ts`: Validates array of enums.
    *   `update-languages.dto.ts`: Validates array of enums.
    *   `update-social-media.dto.ts`: Validates optional social URLs/handles.
    *   `create-certification.dto.ts`: Validates title, institution, year.

## 3. Service Layer (`ProvidersService`)

Implement the business logic, including transactions for array updates.

*   **File:** `src/modules/providers/providers.service.ts`
*   **Methods:**
    *   `updateBio(userId: string, bio: string)`
    *   `updateSpecializations(userId: string, specs: string[])`: Transactional (Delete all -> Insert new).
    *   `updateLanguages(userId: string, langs: string[])`: Transactional (Delete all -> Insert new).
    *   `updateSocialMedia(userId: string, social: SocialMediaDto)`
    *   `getCertifications(userId: string)`
    *   `addCertification(userId: string, dto: CreateCertificationDto)`
    *   `removeCertification(userId: string, certId: string)`

## 4. Controller Layer (`ProvidersProfileController`)

Create a dedicated controller to handle these specific profile routes to keep `ProvidersController` clean, or extend the existing one if preferred. Given the prompt asks for modularity, extending `ProvidersController` but organizing the code logic clearly is best, or creating a sub-controller `src/modules/providers/provider-profile.controller.ts`. I will extend `ProvidersController` for simplicity unless a new file is preferred. **Decision:** Use `ProvidersController` as it already handles `GET /me` and `PATCH /`. I will add the new endpoints there.

*   **Endpoints:**
    *   `PATCH /providers/profile/bio`
    *   `PUT /providers/profile/specializations`
    *   `PUT /providers/profile/languages`
    *   `PATCH /providers/profile/social-media`
    *   `GET /providers/profile/certifications`
    *   `POST /providers/profile/certifications`
    *   `DELETE /providers/profile/certifications/:id`

## 5. Security & Validation

*   **Authorization:** Ensure `userId` from JWT (`req.user.sub`) is used to fetch the provider profile. If no profile exists for the user, return 404/403.
*   **Sanitization:** Use `sanitize-html` (need to install if missing) for the bio field.

## 6. Execution Steps

1.  **Install Dependencies:** `npm install sanitize-html @types/sanitize-html` (if not present).
2.  **Create Entities:** Add `ProviderSpecialization`, `ProviderLanguage` (update existing if needed), `ProviderCertification`.
3.  **Update `ProviderProfile`:** Add social columns.
4.  **Create DTOs:** Implement strict validation with German messages.
5.  **Update Module:** Register new entities in `ProvidersModule`.
6.  **Update Service:** Implement transactional logic.
7.  **Update Controller:** Add endpoints.
8.  **Migration:** Generate and run migration.
