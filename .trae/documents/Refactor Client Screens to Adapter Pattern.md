I have identified the key Client Module screens that require architectural refactoring to meet Rule #1 ("UI never knows API details"). The current implementation in these screens has high coupling with API structures and logic.

**Remaining Screens to Refactor:**
1.  **SearchScreen** (`src/screens/clients/SearchScreen.tsx`): Directly calls `providersApi.search` and handles raw API logic.
2.  **BookingFlow** (`src/screens/clients/BookingFlow.tsx`): Contains hardcoded logic and mock data that should be driven by a domain model and adapter.
3.  **ProviderProfile** (`src/screens/clients/ProviderProfile.tsx`): Uses mock data currently but needs to be wired to a real `IBraider` domain model via an adapter.
4.  **BookingsListScreen** (`src/screens/clients/BookingsListScreen.tsx`): Directly imports `getClientAppointments` and types from `src/api/appointments.ts`.
5.  **BookingHistoryScreen** (`src/screens/clients/BookingHistoryScreen.tsx`): Similar to `BookingsListScreen`, it handles raw data mapping inside the component.

**Plan:**

1.  **Domain Modeling:**
    *   **Enhance `IBraider`:** Ensure it covers the needs of `SearchScreen` and `ProviderProfile` (reviews, gallery, hours).
    *   **Create `IBooking`:** Define a clean domain model for appointments/bookings in `src/domain/models/booking.ts`.

2.  **Adapter Implementation:**
    *   **Update `BraiderAdapter`:** Add methods for search results and full profile details.
    *   **Create `BookingAdapter`:** In `src/api/adapters/bookingAdapter.ts` to transform `AppointmentListItem` DTOs into `IBooking` objects.

3.  **API Abstraction:**
    *   **Update `clientBraiderApi`:** Add `search` and `getProfile` methods using the adapter.
    *   **Create `clientBookingApi`:** In `src/api/clientBooking.ts` to replace direct usage of `getClientAppointments`.

4.  **Screen Refactoring (Sequential):**
    *   **Step 1: SearchScreen:** Refactor to use `clientBraiderApi.search`.
    *   **Step 2: ProviderProfile:** Refactor to use `clientBraiderApi.getProfile` (replacing mock data).
    *   **Step 3: Booking Screens:** Refactor `BookingsListScreen` and `BookingHistoryScreen` to use `clientBookingApi` and `IBooking`.
    *   **Step 4: BookingFlow:** (Time permitting) Refactor to fetch services from `clientBraiderApi` instead of hardcoded data.

This systematic approach ensures the entire "Client" side of the app adheres to the Clean Architecture principles.