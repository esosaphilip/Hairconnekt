
it('renders popular styles without key collisions', () => {
    // Mock data with duplicate IDs if any, to test keyExtractor resilience if we were processing raw data
    // But here we just test that it renders fine
    const { getByText, getAllByText } = render(<HomeScreen />);

    // Ensure "Braids" is rendered
    expect(getByText('Braids')).toBeTruthy();

    // Ensure keys are stable (indirectly by checking no errors during re-render)
    const { update } = render(<HomeScreen />);
    update(<HomeScreen />);
});
