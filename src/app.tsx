import React, { useEffect, useRef, useCallback } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, Platform } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import * as Sentry from '@sentry/react-native';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initializeDeviceInfo } from '@/utils/deviceInfoUtils';

import i18n from '@/i18n';

const LetThemConnect = () => {
  const backHandlerRef = useRef<any>(null);

  const handleBackButtonClick = useCallback(() => {
    Alert.alert(
      i18n.t('EXIT.TITLE'),
      i18n.t('EXIT.SUBTITLE'),
      [
        {
          text: i18n.t('EXIT.CANCEL'),
          onPress: () => {},
          style: 'cancel',
        },
        { text: i18n.t('EXIT.OK'), onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false },
    );
    return true;
  }, []);

  useEffect(() => {
    // Initialize Sentry after component mounts (runtime is ready)
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

    // Initialize device info safely on app start
    initializeDeviceInfo().catch(error => {
      console.error('[App] Failed to initialize device info:', error);
    });

    // Use modern BackHandler API (React Native 0.65+)
    if (Platform.OS === 'android') {
      backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        if (backHandlerRef.current) {
          backHandlerRef.current.remove();
        }
      };
    }
  }, [handleBackButtonClick]);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppNavigator />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default LetThemConnect;
