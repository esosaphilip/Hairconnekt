module.exports = {
    createBottomTabNavigator: jest.fn().mockReturnValue({
        Navigator: ({ children }: any) => children,
        Screen: ({ children }: any) => children,
    }),
};
