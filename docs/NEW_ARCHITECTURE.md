# New Architecture Implementation - Technical Documentation

## Overview
This document explains the implementation of React Native's New Architecture (Fabric + TurboModules) in the Chatwoot Mobile App.

## Purpose
Technical reference for understanding new architecture requirements, dependencies, and implementation details.

---

## 1. What is New Architecture?

React Native's New Architecture consists of:
- **Fabric:** New rendering system
- **TurboModules:** New native module system
- **JSI (JavaScript Interface):** Direct communication between JS and native

### Benefits
- Better performance
- Type safety
- Synchronous native module calls
- Better debugging

---

## 2. Why We Enabled It

### Required Dependencies
1. **react-native-reanimated v4**
   - Requires new architecture
   - Cannot work without it
   - Critical for animations

2. **react-native-worklets**
   - Required by Reanimated v4
   - Enables worklet functions
   - Performance optimization

### Google Play Requirements
- Future-proofing for Android requirements
- Better compatibility with latest Android versions

---

## 3. Configuration

### app.config.ts
```typescript
newArchEnabled: true
```

**Location:** `app.config.ts` line 11
**Impact:** Enables Fabric and TurboModules for entire app

---

## 4. Required Dependencies

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-reanimated` | `~4.1.1` | Animations (requires new arch) |
| `react-native-worklets-core` | `^1.6.2` | Worklet runtime |
| `react-native-worklets` | `^0.6.1` | Worklet utilities |

### Babel Configuration
**File:** `babel.config.js`

Must include:
```javascript
plugins: [
  'react-native-worklets/plugin',
  // ... other plugins
]
```

**Why:** Transforms worklet functions for native execution

---

## 5. Compatible Libraries

### ✅ Compatible (Updated)
- `@react-native-menu/menu` - Updated to v2.0.0
- `react-native-audio-recorder-player` - Updated to v5.0.0-rc.1
- All Expo modules (SDK 54 compatible)
- `react-native-reanimated` v4
- `react-native-worklets`

### ❌ Incompatible (Needs Fix)
- `react-native-document-picker` v9.3.1
  - **Issue:** Uses `GuardedResultAsyncTask` (removed in new arch)
  - **Solution:** Migrate to `expo-document-picker`
  - **Status:** Build failing, fix in progress

---

## 6. Build Configuration

### Android
**File:** `app.config.ts`

```typescript
android: {
  minSdkVersion: 24,
  compileSdkVersion: 35,
  targetSdkVersion: 35,
}
```

### Gradle Properties
New architecture is automatically configured by:
- Expo config plugins
- React Native Gradle plugin
- No manual `gradle.properties` changes needed

---

## 7. Code Changes Required

### Worklet Functions
When using Reanimated, functions that run on UI thread must be worklets:

```typescript
// Before (Old Architecture)
const animatedValue = useSharedValue(0);
const style = useAnimatedStyle(() => {
  'worklet'; // Required annotation
  return { opacity: animatedValue.value };
});

// After (New Architecture - Same syntax, but enforced)
const animatedValue = useSharedValue(0);
const style = useAnimatedStyle(() => {
  'worklet'; // Required and enforced
  return { opacity: animatedValue.value };
});
```

### Native Module Calls
- Synchronous calls possible (with TurboModules)
- Better type safety
- No bridge overhead

---

## 8. Migration Status

### Completed
- [x] Enable new architecture in config
- [x] Update Reanimated to v4
- [x] Add worklets dependencies
- [x] Update compatible libraries
- [x] Configure Babel plugin

### In Progress
- [ ] Fix document picker compatibility
- [ ] Test all animations
- [ ] Verify all native modules work

### Blockers
- `react-native-document-picker` - Needs migration

---

## 9. Testing Checklist

- [ ] All animations work correctly
- [ ] Native modules function properly
- [ ] No performance regressions
- [ ] App builds successfully
- [ ] No runtime crashes
- [ ] Worklets execute correctly

---

## 10. Troubleshooting

### Build Errors

#### "New architecture required"
**Error:** Library requires new architecture but it's disabled
**Solution:** Ensure `newArchEnabled: true` in `app.config.ts`

#### "Worklet not found"
**Error:** Worklet function not recognized
**Solution:** 
1. Check Babel plugin is configured
2. Add `'worklet'` directive
3. Ensure `react-native-worklets` is installed

#### "TurboModule not found"
**Error:** Native module not compatible
**Solution:** Update library to version supporting new architecture

### Runtime Errors

#### "Cannot find native module"
**Solution:** 
1. Rebuild native code: `npx expo prebuild --clean`
2. Clear Metro cache: `npx expo start --clear`
3. Rebuild app

---

## 11. Performance Considerations

### Benefits
- Faster native module calls
- Better animation performance
- Reduced bridge overhead
- Synchronous operations possible

### Monitoring
- Use React Native Performance Monitor
- Check FPS during animations
- Monitor native module call times

---

## 12. Rollback Plan

If new architecture causes issues:

1. **Disable in config:**
   ```typescript
   newArchEnabled: false
   ```

2. **Downgrade dependencies:**
   - Reanimated v3 (doesn't require new arch)
   - Remove worklets dependencies

3. **Revert to SDK 52:**
   - See `docs/SDK54_UPGRADE.md` for reverse migration

**Note:** Rollback will break Reanimated v4 and worklets features

---

## 13. Future Considerations

### Library Compatibility
- Check library compatibility before adding
- Prefer Expo modules (always compatible)
- Check library GitHub for new architecture support

### Updates
- Monitor React Native releases
- Update dependencies regularly
- Test after each update

---

## References
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Reanimated v4 Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Worklets Documentation](https://docs.swmansion.com/react-native-worklets/)

