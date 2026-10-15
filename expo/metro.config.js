const { getSentryExpoConfig } = require("@sentry/react-native/metro")
const path = require('path')

const config = getSentryExpoConfig(__dirname)

const localSnowuiDir = null; //path.resolve("/home/kretst/develop/library/expo-snowui")

const snowuiOverride = localSnowuiDir ? {
  "expo-snowui": localSnowuiDir,
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native')
} : {}

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  snowstream: path.resolve(__dirname, 'src'),
  "snowstream-player": path.resolve(__dirname, 'src/player'),
  ...snowuiOverride
}

if (localSnowuiDir) {
  config.watchFolders = [
    ...(config.watchFolders || []),
    localSnowuiDir
  ]

  config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(localSnowuiDir, 'node_modules')
  ]

  config.resolver.disableHierarchicalLookup = true
}

config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native']

module.exports = config