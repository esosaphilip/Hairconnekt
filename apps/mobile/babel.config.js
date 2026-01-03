module.exports = function (api) {

  return {
    presets: [
      // This preset includes react-native and TypeScript support out of the box
      // This preset includes react-native and TypeScript support out of the box
      ['babel-preset-expo', { reanimated: !api.env('test') }],
    ],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.json'],
          root: ['./'],
          alias: {
            '@': './src',
            ...(api.env('test') ? { 'react-native-worklets/plugin': './test/mock-worklets-plugin.js' } : {}),
          },
        },
      ],
      // Reanimated plugin must be listed last
      // Reanimated plugin must be listed last
      !api.env('test') ? 'react-native-reanimated/plugin' : null,
    ].filter(Boolean),
  };
};
