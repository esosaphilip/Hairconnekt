module.exports = {
    createNativeStackNavigator: jest.fn().mockReturnValue({
        Navigator: ({ children }: any) => children,
        Screen: ({ children }: any) => children,
        Group: ({ children }: any) => children,
    }),
};
