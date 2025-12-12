module.exports = {
  dependencies: {
    'ffmpeg-kit-react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
      },
    },
    '@notifee/react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
      },
    },
    '@react-native-community/slider': {
      platforms: {
        android: null, // 👈 prevents Android autolinking in production builds (only used by Storybook in dev)
      },
    },
  },
};
