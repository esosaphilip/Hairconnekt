I have analyzed the `ProvidersService` and the relevant entities. The goal is to move business logic from the service into the entities to create a Rich Domain Model.

Here is the plan:

1.  **Refactor `ProviderProfile` Entity:**
    *   Add `updateBio(bio: string)` method: Handles sanitization.
    *   Add `updateSocialMedia(dto: UpdateSocialMediaDto)` method: Updates social media fields.
    *   Add `updateProfile(dto: UpdateProviderDto)` method: Updates basic profile fields.
    *   Add validation logic for maximum certifications (though the repository count check in service might still be needed for efficiency, the entity can enforce the limit if the collection is loaded).
    *   *Note on Certification Limit:* Since certifications are a `OneToMany` relation, checking the limit inside the entity requires the `certifications` array to be loaded. If it is loaded, we can enforce `addCertification(cert: ProviderCertification)` method on `ProviderProfile` that checks `this.certifications.length`.

2.  **Refactor `ProviderAvailability` Entity:**
    *   Currently, `setAvailability` in the service replaces all slots.
    *   We can create a static factory method or validation method in `ProviderAvailability` to validate time slots (start < end, valid format) before creation.
    *   Or better, adding a method `validate()` to the entity that throws if state is invalid.

3.  **Refactor `User` Entity:**
    *   Add `isVip()` method (logic currently in `getClients` service method, but that logic seems to calculate VIP status for *clients of a provider*, not the User entity itself. The `User` entity represents a system user. The VIP logic in `getClients` is `c.appointments >= 5 || c.totalSpentCents >= 50000`. This logic belongs to a domain concept of "ProviderClient" or aggregation, but we can't easily move it to `User` without loading all appointments. We will focus on moving the `User` specific logic if any).
    *   Actually, looking at `ProvidersService.ts`, `getClients` constructs an ad-hoc object. The VIP status is dynamic based on history.

4.  **Refactor `ProvidersService`:**
    *   Update `updateBio` to use `provider.updateBio()`.
    *   Update `updateSocialMedia` to use `provider.updateSocialMedia()`.
    *   Update `updateProfile` to use `provider.updateProfile()`.
    *   Update `addCertification` to use `provider.addCertification()` (requires loading certifications).
    *   Update `setAvailability` to use `ProviderAvailability.create(dto)` or similar factory that validates.

**Detailed Implementation Steps:**

1.  **Modify `backend/src/modules/providers/entities/provider-profile.entity.ts`:**
    *   Import `sanitize-html`.
    *   Implement `updateBio(bio: string)`.
    *   Implement `updateSocialMedia(dto: Partial<UpdateSocialMediaDto>)`.
    *   Implement `updateDetails(dto: Partial<UpdateProviderDto>)`.
    *   Implement `checkCertificationLimit()` or `canAddCertification()`.

2.  **Modify `backend/src/modules/providers/entities/provider-availability.entity.ts`:**
    *   Add validation logic for start/end times in a constructor or `beforeInsert`/`beforeUpdate` hook, or a static creation method. Let's add a static `create` method that validates.

3.  **Modify `backend/src/modules/providers/providers.service.ts`:**
    *   Refactor methods to use the new entity methods.
    *   Remove raw logic (sanitization, field mapping) from the service.

**Note on "User.isVip()"**: The prompt mentions `User.isVip()`, but in the code, VIP status is calculated per provider-client relationship in `getClients`. I will stick to the logic found in `ProvidersService`.

**Note on Sanitization**: `sanitize-html` is currently used in the service. Moving it to the entity adds a dependency to the entity file. This is acceptable for a Rich Domain Model.

Let's proceed with these changes.