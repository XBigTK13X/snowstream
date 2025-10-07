const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Expo’s custom resolver stack overrides `config.resolver.alias`.
// You must also set `resolver.extraNodeModules`:
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  snowstream: path.resolve(__dirname, 'src'),
};

module.exports = config;
