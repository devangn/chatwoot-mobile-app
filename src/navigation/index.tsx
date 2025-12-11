import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { getStateFromPath } from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { AppTabs } from './tabs/AppTabs';
import i18n from 'i18n';
import { navigationRef } from '@/utils/navigationUtils';
import { findConversationLinkFromPush, findNotificationFromFCM } from '@/utils/pushUtils';
import { extractConversationIdFromUrl } from '@/utils/conversationUtils';
import { useAppSelector } from '@/hooks';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RefsProvider } from '@/context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { transformNotification } from '@/utils/camelCaseKeys';
import Inter40020 from '@/assets/fonts/Inter-400-20.ttf';
import Inter42020 from '@/assets/fonts/Inter-420-20.ttf';
import Inter50024 from '@/assets/fonts/Inter-500-24.ttf';
import Inter58024 from '@/assets/fonts/Inter-580-24.ttf';
import Inter60020 from '@/assets/fonts/Inter-600-20.ttf';

// Safely initialize Firebase messaging background handler
try {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
} catch (error) {
  console.error('[Navigation] Failed to set background message handler:', error);
  // Don't crash if Firebase messaging fails to initialize
}

export const AppNavigationContainer = () => {
  const [fontsLoaded] = useFonts({
    'Inter-400-20': Inter40020,
    'Inter-420-20': Inter42020,
    'Inter-500-24': Inter50024,
    'Inter-580-24': Inter58024,
    'Inter-600-20': Inter60020,
  });

  const routeNameRef = useRef<string | undefined>(undefined);

  const installationUrl = useAppSelector(selectInstallationUrl);
  const locale = useAppSelector(selectLocale);

  const linking = {
    prefixes: [installationUrl],
    config: {
      screens: {
        ChatScreen: {
          path: 'app/accounts/:accountId/conversations/:conversationId/:primaryActorId?/:primaryActorType?',
          parse: {
            conversationId: (conversationId: string) => parseInt(conversationId),
            primaryActorId: (primaryActorId: string) => parseInt(primaryActorId),
            primaryActorType: (primaryActorType: string) => decodeURIComponent(primaryActorType),
          },
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getStateFromPath: (path: string, config: any) => {
      let primaryActorId = null;
      let primaryActorType = null;
      const state = getStateFromPath(path, config);
      const { routes } = state || {};

      const conversationId = extractConversationIdFromUrl({
        url: path,
      });

      if (!conversationId) {
        return;
      }

      if (routes && routes[0]) {
        const { params } = routes[0];
        primaryActorId = (params as { primaryActorId?: number })?.primaryActorId;
        primaryActorType = (params as { primaryActorType?: string })?.primaryActorType;
      }
      return {
        routes: [
          {
            name: 'ChatScreen',
            params: {
              conversationId: conversationId,
              primaryActorId,
              primaryActorType,
            },
          },
        ],
      };
    },
    async getInitialURL() {
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();

      if (url != null) {
        return url;
      }

      // getInitialNotification: When the application is opened from a quit state.
      try {
        const message = await messaging().getInitialNotification();
        if (message) {
          const notification = findNotificationFromFCM({ message });
          const camelCaseNotification = transformNotification(notification);
          const conversationLink = findConversationLinkFromPush({
            notification: camelCaseNotification,
            installationUrl,
          });
          if (conversationLink) {
            return conversationLink;
          }
        }
      } catch (error) {
        console.error('[Navigation] Failed to get initial notification:', error);
        // Continue without initial notification
      }
      return undefined;
    },
    subscribe(listener: (arg0: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => listener(url);

      // Listen to incoming links from deep linking
      const subscription = Linking.addEventListener('url', onReceiveURL);

      //onNotificationOpenedApp: When the application is running, but in the background.
      let unsubscribeNotification: (() => void) | null = null;
      try {
        unsubscribeNotification = messaging().onNotificationOpenedApp(message => {
          if (message) {
            try {
              const notification = findNotificationFromFCM({ message });
              const camelCaseNotification = transformNotification(notification);

              const conversationLink = findConversationLinkFromPush({
                notification: camelCaseNotification,
                installationUrl,
              });
              if (conversationLink) {
                listener(conversationLink);
              }
            } catch (error) {
              console.error('[Navigation] Error processing notification:', error);
            }
          }
        });
      } catch (error) {
        console.error('[Navigation] Failed to set up notification listener:', error);
        // Create a no-op unsubscribe function if setup fails
        unsubscribeNotification = () => {};
      }

      return () => {
        try {
          subscription.remove();
          if (unsubscribeNotification) {
            unsubscribeNotification();
          }
        } catch (error) {
          console.error('[Navigation] Error cleaning up listeners:', error);
        }
      };
    },
  };

  i18n.locale = locale;

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('[Navigation] Failed to hide splash screen:', error);
        // Continue even if splash screen fails to hide
      }
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Show loading indicator while fonts are loading
    return (
      <View style={styles.navigationLayout}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      fallback={<ActivityIndicator animating />}>
      <BottomSheetModalProvider>
        <View style={styles.navigationLayout} onLayout={onLayoutRootView}>
          <AppTabs />
        </View>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
};
export const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={styles.navigationLayout}>
      <KeyboardProvider>
        <RefsProvider>
          <SafeAreaProvider>
            <AppNavigationContainer />
          </SafeAreaProvider>
        </RefsProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  navigationLayout: {
    flex: 1,
  },
});
