import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useServices } from '../useServices';
import { ServiceUseCases } from '@/domain/usecases/ServiceUseCases';

// Mock dependencies
jest.mock('@/auth/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/domain/usecases/ServiceUseCases', () => ({
    ServiceUseCases: jest.fn().mockImplementation(() => ({
        listServices: jest.fn(),
        createService: jest.fn(),
        updateService: jest.fn(),
        deleteService: jest.fn(),
    })),
}));

jest.mock('@/data/repositories/ServiceRepositoryImpl', () => ({
    ServiceRepositoryImpl: jest.fn(),
}));

import { useAuth } from '@/auth/AuthContext';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useServices - UUID Validation Error Clearing', () => {
    const validUserId = '123e4567-e89b-12d3-a456-426614174000';
    const invalidUserId = 'invalid-id';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should clear error and services when user ID is invalid', async () => {
        // Start with a valid user to simulate initial load
        mockUseAuth.mockReturnValue({
            user: { id: validUserId, email: 'test@example.com' },
            loading: false,
        } as any);

        const mockListServices = jest.fn().mockRejectedValue(new Error('UUID validation failed'));
        (ServiceUseCases as jest.Mock).mockImplementation(() => ({
            listServices: mockListServices,
        }));

        const { result, rerender } = renderHook(() => useServices());

        // Wait for initial load to fail and set error
        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        // Verify error is set
        expect(result.current.error).toContain('UUID validation failed');

        // Now change to invalid user ID
        mockUseAuth.mockReturnValue({
            user: { id: invalidUserId, email: 'test@example.com' },
            loading: false,
        } as any);

        // Re-render to trigger the hook with new user
        rerender();

        // Wait for the guard to clear error
        await waitFor(() => {
            expect(result.current.error).toBeNull();
        });

        // Verify error was cleared
        expect(result.current.error).toBeNull();
        expect(result.current.services).toEqual([]);
    });

    it('should clear error and services when user ID is missing', async () => {
        // Start with valid user
        mockUseAuth.mockReturnValue({
            user: { id: validUserId, email: 'test@example.com' },
            loading: false,
        } as any);

        const mockListServices = jest.fn().mockRejectedValue(new Error('Some error'));
        (ServiceUseCases as jest.Mock).mockImplementation(() => ({
            listServices: mockListServices,
        }));

        const { result, rerender } = renderHook(() => useServices());

        // Wait for error
        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        // Change to missing user
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        } as any);

        rerender();

        // Verify error was cleared
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

        const mockListServices = jest.fn();
        (ServiceUseCases as jest.Mock).mockImplementation(() => ({
            listServices: mockListServices,
        }));

        const { result } = renderHook(() => useServices());

        // Wait a bit to ensure no API call is made
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        // Verify API was never called
        expect(mockListServices).not.toHaveBeenCalled();
        // Verify state is clean
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
        const mockListServices = jest.fn().mockResolvedValue(mockServices);
        (ServiceUseCases as jest.Mock).mockImplementation(() => ({
            listServices: mockListServices,
        }));

        const { result } = renderHook(() => useServices());

        // Wait for services to load
        await waitFor(() => {
            expect(result.current.services.length).toBeGreaterThan(0);
        });

        // Verify API was called
        expect(mockListServices).toHaveBeenCalled();
        // Verify services loaded
        expect(result.current.services).toEqual(mockServices);
        expect(result.current.error).toBeNull();
    });
});
