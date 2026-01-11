import Constants from 'expo-constants';
import App from './src/app';

// TODO: It is a temporary fix to fix the reanimated logger issue
// Ref: https://github.com/gorhom/react-native-bottom-sheet/issues/1983
// https://github.com/dohooo/react-native-reanimated-carousel/issues/706
import './reanimatedConfig';
// import './wdyr';

const isStorybookEnabled = Constants.expoConfig?.extra?.eas?.storybookEnabled;

// Sentry initialization moved to src/app.tsx useEffect to avoid "runtime not ready" errors
// Initializing at module load time causes crashes because JS runtime isn't ready yet

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

  // Don't use Sentry.wrap here as it can cause "runtime not ready" errors
  // ErrorBoundary in src/app.tsx already handles errors and reports to Sentry
  console.log('Loading Development App');
  return App;
})();
