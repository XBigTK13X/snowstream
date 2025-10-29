const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require('path');

const config = getSentryExpoConfig(__dirname);

// Expo’s custom resolver stack overrides `config.resolver.alias`.
// You must also set `resolver.extraNodeModules`:
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  snowstream: path.resolve(__dirname, 'src'),
};

config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native']

module.exports = config;
