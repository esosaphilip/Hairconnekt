// include this line for mocking react-native-gesture-handler
import 'react-native-gesture-handler/jestSetup';

// Mock rootNavigation
jest.mock('@/navigation/rootNavigation', () => ({
    rootNavigationRef: {
        current: {
            navigate: jest.fn(),
        },
    },
}));

// Mock AuthContext
jest.mock('@/auth/AuthContext', () => ({
    useAuth: () => ({
        tokens: { accessToken: 'dummy' },
        user: { firstName: 'Test', email: 'test@example.com' },
    }),
}));

// Mock LocationContext
jest.mock('@/context/LocationContext', () => ({
    useLocation: () => ({
        location: { label: 'Test City', lat: 10, lon: 10 },
    }),
}));

// Mock ClientBraider API
jest.mock('@/api/clientBraider', () => ({
    clientBraiderApi: {
        getNearby: jest.fn().mockResolvedValue([]),
    },
}));

// Mock useI18n
jest.mock('@/i18n', () => ({
    useI18n: () => ({
        t: (k) => k,
        locale: 'en',
    }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
    return {
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
            removeListener: jest.fn(),
            isFocused: () => true,
        }),
        useFocusEffect: jest.fn(),
    };
});

// Mock FlashMessage
jest.mock('react-native-flash-message', () => ({
    showMessage: jest.fn(),
}));

// Mock Logger
jest.mock('@/services/logger', () => ({
    logger: {
        error: jest.fn(),
    },
}));
