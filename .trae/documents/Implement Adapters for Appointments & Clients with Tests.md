I have researched the existing code and identified the necessary changes to implement the Frontend Model Adapter pattern for Appointments and Clients, and to add unit tests.

**Plan:**

1.  **Define Domain Models:**
    *   Create `apps/mobile/src/domain/models/appointment.ts` defining `IAppointment` and `IAppointmentRequest`.
    *   Create `apps/mobile/src/domain/models/client.ts` defining `IClient` and `IClientStats`.

2.  **Create Adapters:**
    *   Create `apps/mobile/src/api/adapters/appointmentAdapter.ts` with `AppointmentAdapter` to transform DTOs.
    *   Create `apps/mobile/src/api/adapters/clientAdapter.ts` with `ClientAdapter` to transform DTOs.

3.  **Update APIs:**
    *   Update `apps/mobile/src/api/providerAppointments.ts` to use `AppointmentAdapter`.
    *   Update `apps/mobile/src/api/providerClients.ts` to use `ClientAdapter`.

4.  **Update Screens:**
    *   Update `apps/mobile/src/screens/provider/AppointmentRequestScreen.tsx` to use `IAppointmentRequest`.
    *   Update `apps/mobile/src/screens/provider/ProviderClients.tsx` to use `IClient`.
    *   Update `apps/mobile/src/screens/provider/ClientDetailScreen.tsx` to use `IClient`.

5.  **Add Unit Tests:**
    *   Create `apps/mobile/src/api/adapters/__tests__/providerAdapter.test.ts`
    *   Create `apps/mobile/src/api/adapters/__tests__/appointmentAdapter.test.ts`
    *   Create `apps/mobile/src/api/adapters/__tests__/clientAdapter.test.ts`

This will fully decouple the UI from the API structure for these key modules and ensure robustness through testing.