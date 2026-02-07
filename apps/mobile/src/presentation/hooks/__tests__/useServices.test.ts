import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useServices } from '../useServices';
import { useAuth } from '@/auth/AuthContext';

// Mock Auth Context only
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// We don't need to mock ServiceUseCases module anymore since we inject the mock!
// We only need to mock Repository if it's imported at top level (it is).
jest.mock('@/data/repositories/ServiceRepositoryImpl', () => ({
    ServiceRepositoryImpl: jest.fn(),
}));
// We might still need to mock ServiceUseCases module just to prevent "new ServiceUseCases" inside useServices.ts from complaining
// about constructor arguments or dependencies, even if we override it.
jest.mock('@/domain/usecases/ServiceUseCases', () => ({
    ServiceUseCases: jest.fn(),
}));


const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useServices - UUID Validation Error Clearing', () => {
    const validUserId = '123e4567-e89b-12d3-a456-426614174000';
    const invalidUserId = 'invalid-id';

    // Mock object to be injected
    let mockServiceUseCases: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockServiceUseCases = {
            listServices: jest.fn().mockResolvedValue([]),
            createService: jest.fn().mockResolvedValue({}),
            updateService: jest.fn().mockResolvedValue({}),
            deleteService: jest.fn().mockResolvedValue(undefined),
            toggleServiceActive: jest.fn().mockResolvedValue({}),
        };
    });

    it('should clear error and services when user ID is invalid', async () => {
        mockUseAuth.mockReturnValue({
            user: { id: validUserId, email: 'test@example.com' },
            loading: false,
        } as any);

        // Fail first
        mockServiceUseCases.listServices.mockRejectedValue(new Error('UUID validation failed'));

        // Inject the mock!
        const { result, rerender } = renderHook(() => useServices(mockServiceUseCases));

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        expect(result.current.error).toContain('UUID validation failed');

        // Switch to invalid user
        mockUseAuth.mockReturnValue({
            user: { id: invalidUserId, email: 'test@example.com' },
            loading: false,
        } as any);

        rerender();

        await waitFor(() => {
            expect(result.current.error).toBeNull();
        });

        expect(result.current.error).toBeNull();
        expect(result.current.services).toEqual([]);
    });

    it('should clear error and services when user ID is missing', async () => {
        mockUseAuth.mockReturnValue({
            user: { id: validUserId, email: 'test@example.com' },
            loading: false,
        } as any);

        mockServiceUseCases.listServices.mockRejectedValue(new Error('Some error'));

        const { result, rerender } = renderHook(() => useServices(mockServiceUseCases));

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        } as any);

        rerender();

        await waitFor(() => {
            expect(result.current.error).toBeNull();
        });

        expect(result.current.services).toEqual([]);
    });

    it('should not call API when user ID is invalid', async () => {
        mockUseAuth.mockReturnValue({
            user: { id: invalidUserId, email: 'test@example.com' },
            loading: false,
        } as any);

        const { result } = renderHook(() => useServices(mockServiceUseCases));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(mockServiceUseCases.listServices).not.toHaveBeenCalled();
        expect(result.current.error).toBeNull();
        expect(result.current.services).toEqual([]);
    });

    it('should work normally with valid UUID', async () => {
        mockUseAuth.mockReturnValue({
            user: { id: validUserId, email: 'test@example.com' },
            loading: false,
        } as any);

        const mockServices = [
            { id: '1', name: 'Service 1', priceCents: 1000, durationMinutes: 60 },
        ];

        mockServiceUseCases.listServices.mockResolvedValue(mockServices);

        const { result } = renderHook(() => useServices(mockServiceUseCases));

        await waitFor(() => {
            expect(result.current.services.length).toBeGreaterThan(0);
        });

        expect(mockServiceUseCases.listServices).toHaveBeenCalled();
        expect(result.current.services).toEqual(mockServices);
    });
});
