/* eslint-disable @typescript-eslint/no-var-requires */
import Animated from 'react-native-reanimated';

export const NativeView =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native/Libraries/Components/View/ViewNativeComponent').default;

// Create AnimatedNativeView at module level - this is safe because createAnimatedComponent
// only creates a wrapper component and doesn't call native code until render
export const AnimatedNativeView = Animated.createAnimatedComponent(
  NativeView,
) as unknown as typeof NativeView;
