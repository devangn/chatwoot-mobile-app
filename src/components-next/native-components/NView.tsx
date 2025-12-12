/* eslint-disable @typescript-eslint/no-var-requires */
import Animated from 'react-native-reanimated';

export const NativeView =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native/Libraries/Components/View/ViewNativeComponent').default;

// Lazy-load AnimatedNativeView to avoid "runtime not ready" errors
let AnimatedNativeViewComponent: ReturnType<typeof Animated.createAnimatedComponent<typeof NativeView>> | null = null;
export function getAnimatedNativeView() {
  if (!AnimatedNativeViewComponent) {
    AnimatedNativeViewComponent = Animated.createAnimatedComponent(
      NativeView,
    ) as unknown as typeof NativeView;
  }
  return AnimatedNativeViewComponent;
}

// Export a getter function instead of the component directly
// This ensures the component is only created when first accessed
export const AnimatedNativeView = new Proxy({} as typeof NativeView, {
  get(_target, prop) {
    return getAnimatedNativeView()[prop as keyof typeof NativeView];
  },
}) as typeof NativeView;
