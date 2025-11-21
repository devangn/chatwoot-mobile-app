// 16KB page size support for React Native/Expo
// Expo SDK 54+ and React Native 0.81+ should support 16KB page sizes automatically
// if all native dependencies are compatible. The build system handles 16KB alignment.
// No additional Gradle configuration needed as it's handled by the build tools.

module.exports = config => config;

