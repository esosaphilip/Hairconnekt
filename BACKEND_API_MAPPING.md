# Backend API Mapping

This document maps the mobile app's API calls to the actual backend endpoints.

## ✅ Confirmed Backend Endpoints

### Services
- `GET /api/v1/services/provider` - List services for authenticated provider ✅ EXISTS
- `POST /api/v1/services` - Create new service ✅ EXISTS

### Auth
- `POST /api/v1/auth/login` ✅ EXISTS
- `POST /api/v1/auth/register` ✅ EXISTS
- `POST /api/v1/auth/refresh` ✅ EXISTS
- `POST /api/v1/auth/logout` ✅ EXISTS
- `POST /api/v1/auth/social-login` ✅ EXISTS

### Payments
- `POST /api/v1/payments/intent` ✅ EXISTS
- `POST /api/v1/payments/payout` ✅ EXISTS
- `GET /api/v1/payments/transactions` ✅ EXISTS
- `GET /api/v1/payments/payouts` ✅ EXISTS

## ⚠️ Missing Backend Endpoints (Need Implementation)

### Services
- `PATCH /api/v1/services/:id` - Update service ❌ MISSING
- `DELETE /api/v1/services/:id` - Delete service ❌ MISSING

### Vouchers
- `GET /api/v1/providers/vouchers` - List vouchers ❓ NEEDS VERIFICATION
- `POST /api/v1/providers/vouchers` - Create voucher ❓ NEEDS VERIFICATION
- `PUT /api/v1/providers/vouchers/:id` - Update voucher ❓ NEEDS VERIFICATION
- `DELETE /api/v1/providers/vouchers/:id` - Delete voucher ❓ NEEDS VERIFICATION

## Implementation Notes

1. **Mobile App Uses Existing Backend**: The mobile app uses the existing `http` client from `src/api/http.ts` which connects to the backend at `API_BASE_URL` (configured in `src/config.ts`).

2. **Clean Architecture Pattern**: 
   - The mobile app follows clean architecture with domain/data/presentation layers
   - The data layer (repositories) calls the existing backend API
   - No duplicate API code - just organized access patterns

3. **Constants File Purpose**: 
   - `src/constants/api.ts` centralizes endpoint paths (following DRY principle)
   - This prevents hardcoding URLs throughout the codebase
   - All endpoints reference the existing backend

4. **Repository Pattern**:
   - `ServiceRepositoryImpl` uses the existing `http` client
   - Maps backend DTOs to domain entities
   - Handles errors and converts them to domain errors

## Next Steps

1. **Backend**: Add missing service endpoints (PATCH, DELETE)
2. **Backend**: Verify/implement voucher endpoints
3. **Mobile**: Update repository implementations once backend endpoints are available
4. **Mobile**: Test all API integrations

## Current Status

- ✅ Mobile app correctly uses existing backend API
- ✅ Clean architecture properly separates concerns
- ✅ Constants centralize endpoint paths (no duplication)
- ⚠️ Some endpoints need backend implementation
- ⚠️ Voucher endpoints need verification

