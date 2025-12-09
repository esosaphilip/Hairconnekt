module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // This preset includes react-native and TypeScript support out of the box
      'babel-preset-expo',
    ],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.json'],
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
      // Reanimated plugin must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
