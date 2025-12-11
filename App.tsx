import * as Sentry from '@sentry/react-native';

import Constants from 'expo-constants';
import App from './src/app';

// TODO: It is a temporary fix to fix the reanimated logger issue
// Ref: https://github.com/gorhom/react-native-bottom-sheet/issues/1983
// https://github.com/dohooo/react-native-reanimated-carousel/issues/706
import './reanimatedConfig';
// import './wdyr';

const isStorybookEnabled = Constants.expoConfig?.extra?.eas?.storybookEnabled;

if (!__DEV__) {
  try {
    const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        tracesSampleRate: 1.0,
        attachScreenshot: true,
        enableAutoSessionTracking: true,
        beforeSend(event) {
          // Filter out known non-critical errors
          if (event.exception) {
            const errorMessage = event.exception.values?.[0]?.value || '';
            // Don't send device info initialization errors as they're handled gracefully
            if (errorMessage.includes('DeviceInfo') || errorMessage.includes('InstallReferrer')) {
              return null;
            }
          }
          return event;
        },
      });
      console.log('[App] Sentry initialized successfully');
    } else {
      console.warn('[App] Sentry DSN not configured, skipping initialization');
    }
  } catch (error) {
    console.error('[App] Failed to initialize Sentry:', error);
    // Don't crash the app if Sentry fails to initialize
  }
}

if (__DEV__) {
  // eslint-disable-next-line
  require('./ReactotronConfig');
}
// Ref: https://dev.to/dannyhw/how-to-swap-between-react-native-storybook-and-your-app-p3o
export default (() => {
  if (isStorybookEnabled === 'true') {
    // eslint-disable-next-line
    return require('./.storybook').default;
  }

  if (!__DEV__) {
    return Sentry.wrap(App);
  }

  console.log('Loading Development App');
  return App;
})();
