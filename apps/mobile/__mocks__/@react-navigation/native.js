const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
const mockSetOptions = jest.fn();

module.exports = {
    __esModule: true,
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
        dispatch: mockDispatch,
        setOptions: mockSetOptions,
        addListener: jest.fn(),
        removeListener: jest.fn(),
    }),
    useRoute: () => ({
        params: {},
        name: 'MockedRoute',
    }),
    useFocusEffect: (callback) => {
        const React = require('react');
        React.useEffect(() => {
            const cleanup = callback();
            return () => {
                if (typeof cleanup === 'function') {
                    cleanup();
                }
            };
        }, [callback]);
    },
    createNavigationContainerRef: jest.fn(() => ({
        isReady: jest.fn(),
        navigate: mockNavigate,
        goBack: mockGoBack,
        dispatch: mockDispatch,
    })),
    // Expose mocks for asserting in tests
    mockNavigate,
    mockGoBack,
};
