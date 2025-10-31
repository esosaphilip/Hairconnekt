module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // This preset includes react-native and TypeScript support out of the box
      'babel-preset-expo',
    ],
    plugins: [
      // Reanimated plugin must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};