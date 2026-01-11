# Dependency Updates - Technical Reference

## Overview
Complete list of all dependency updates made during the SDK 54 upgrade and new architecture implementation.

## Purpose
Quick reference for:
- What versions were changed
- Why they were changed
- Where to find them in package.json
- Conflict resolution when merging

---

## 1. Major Framework Updates

### Core Framework
```json
{
  "expo": "~52.0.46" → "^54.0.25",
  "react": "18.3.1" → "19.1.0",
  "react-native": "0.76.9" → "0.81.5",
  "react-dom": "18.3.1" → "19.1.0"
}
```

**Reason:** SDK 54 requires React 19 and RN 0.81
**Breaking Changes:** React 19 has breaking changes, test thoroughly

---

## 2. Expo Modules

### Application & System
```json
{
  "expo-application": "~6.0.2" → "~7.0.7",
  "expo-constants": "~17.0.8" → "~18.0.10",
  "expo-device": "~7.0.3" → "~8.0.9",
  "expo-system-ui": "~4.0.9" → "~6.0.8"
}
```

### Media & Assets
```json
{
  "expo-av": "~15.0.2" → "~16.0.7",
  "expo-image": "~2.0.7" → "~3.0.10",
  "expo-font": "~13.0.4" → "~14.0.9"
}
```

### File System & Storage
```json
{
  "expo-file-system": "~18.0.12" → "~19.0.19"
}
```

### UI & Interaction
```json
{
  "expo-haptics": "~14.0.1" → "~15.0.7",
  "expo-splash-screen": "~0.29.24" → "~31.0.11",
  "expo-status-bar": "~2.0.1" → "~3.0.8",
  "expo-web-browser": "~14.0.2" → "~15.0.9"
}
```

### Notifications
```json
{
  "expo-notifications": "~0.29.14" → "~0.32.13"
}
```

### Build & Development
```json
{
  "expo-build-properties": "~0.13.2" → "~1.0.9",
  "expo-dev-client": "~5.0.20" → "~6.0.18"
}
```

**Reason:** All modules updated for SDK 54 compatibility
**Impact:** New features, bug fixes, performance improvements

---

## 3. React Native Community Packages

### Navigation & Gestures
```json
{
  "react-native-gesture-handler": "2.20.2" → "~2.28.0",
  "react-native-screens": "4.4.0" → "~4.16.0",
  "react-native-safe-area-context": "4.12.0" → "~5.6.0"
}
```

### Animations
```json
{
  "react-native-reanimated": "3.16.7" → "~4.1.1"
}
```
**Critical:** Requires new architecture

### UI Components
```json
{
  "react-native-pager-view": "6.5.1" → "6.9.1",
  "react-native-svg": "15.8.0" → "15.12.1",
  "react-native-webview": "13.12.5" → "13.15.0",
  "@react-native-community/datetimepicker": "8.2.0" → "8.4.4",
  "@react-native-community/slider": "4.5.5" → "5.0.1"
}
```

### Input
```json
{
  "react-native-keyboard-controller": "1.18.6" → "1.18.5"
}
```
**Note:** Downgraded (compatibility issue)

**Reason:** React Native 0.81 compatibility
**Impact:** Better performance, new features

---

## 4. New Dependencies Added

### Worklets (Required for Reanimated v4)
```json
{
  "react-native-worklets-core": "^1.6.2",
  "react-native-worklets": "^0.6.1"
}
```

**Reason:** Required by Reanimated v4 for new architecture
**Impact:** Enables worklet functions for better performance

### Development Tools
```json
{
  "patch-package": "^8.0.1",
  "postinstall-postinstall": "^2.1.0"
}
```

**Reason:** For patching incompatible libraries
**Impact:** Allows custom fixes for third-party packages

---

## 5. Updated Third-Party Libraries

### Menu
```json
{
  "@react-native-menu/menu": "^1.2.0" → "^2.0.0"
}
```
**Reason:** New architecture support
**Status:** ✅ Working

### Audio Recorder
```json
{
  "react-native-audio-recorder-player": "^3.6.11" → "^5.0.0-rc.1"
}
```
**Reason:** New architecture support (RC version)
**Status:** ⚠️ Deprecated, consider migrating to `react-native-nitro-sound`
**Note:** Package is deprecated, migration recommended

### Sentry
```json
{
  "@sentry/react-native": "~6.10.0" → "~7.2.0"
}
```
**Reason:** React Native 0.81 compatibility
**Impact:** Updated error tracking

---

## 6. Type Definitions

```json
{
  "@types/react": "~18.3.18" → "~19.1.10"
}
```

**Reason:** Match React 19 version
**Impact:** Updated TypeScript types

---

## 7. ESLint Configuration

```json
{
  "eslint-config-expo": "8.0.1" → "~10.0.0"
}
```

**Reason:** SDK 54 compatibility
**Impact:** Updated linting rules

---

## 8. Dependency Conflict Resolution

### .npmrc Configuration
```
legacy-peer-deps=true
```

**Reason:** React 19 has peer dependency conflicts
**Impact:** Allows installation despite warnings
**Note:** Some packages may not be fully compatible

---

## 9. Removed Dependencies

None - all dependencies were updated, none removed.

---

## 10. Package.json Structure

### Dependencies Section
All production dependencies updated in `package.json` lines 35-120

### DevDependencies Section
- `@types/react` updated
- `eslint-config-expo` updated
- `patch-package` added
- `postinstall-postinstall` added

### Scripts Section
- `postinstall` script added for patch-package

---

## 11. Conflict Resolution Guide

When merging with master/develop:

### package.json Conflicts

1. **Keep our versions for:**
   - `expo` (54.x)
   - `react` (19.x)
   - `react-native` (0.81.x)
   - `react-native-reanimated` (4.x)
   - All Expo modules (SDK 54 versions)

2. **Merge new dependencies from master:**
   - If master adds new packages, add them
   - If master updates packages we haven't touched, merge their versions
   - Test after merging

3. **Resolve conflicts manually:**
   - Check if master's version is compatible with SDK 54
   - If not, keep our version and note in PR

### package-lock.json
- Regenerate after resolving package.json conflicts
- Run `npm install` to update lock file

---

## 12. Version Compatibility Matrix

| React | React Native | Expo SDK | Reanimated |
|-------|--------------|----------|------------|
| 19.1.0 | 0.81.5 | 54.x | 4.1.1 |

**All dependencies must be compatible with this matrix**

---

## 13. Testing After Updates

After any dependency update:
1. Clear node_modules: `rm -rf node_modules`
2. Clear lock file: `rm package-lock.json`
3. Install: `npm install`
4. Clear Metro cache: `npx expo start --clear`
5. Rebuild native: `npx expo prebuild --clean`
6. Test app functionality

---

## 14. Future Updates

### Recommended Updates
- Monitor Expo SDK releases
- Update Expo modules regularly
- Check React Native releases
- Update Reanimated when stable releases available

### Avoid Updates
- Don't update React/RN unless Expo SDK requires it
- Don't update Reanimated to v5 until stable
- Test thoroughly before updating critical dependencies

---

## 15. Quick Reference

### Critical Dependencies (Don't Downgrade)
- `expo@^54.0.25`
- `react@19.1.0`
- `react-native@0.81.5`
- `react-native-reanimated@~4.1.1`
- `react-native-worklets@^0.6.1`

### Can Be Updated (With Testing)
- Expo modules (minor/patch versions)
- Community packages (check compatibility)
- Dev dependencies

### Needs Migration
- `react-native-audio-recorder-player` → `react-native-nitro-sound`
- `react-native-document-picker` → `expo-document-picker`

---

## References
- [Expo SDK 54 Changelog](https://expo.dev/changelog)
- [React 19 Release Notes](https://react.dev/blog)
- [React Native 0.81 Release Notes](https://reactnative.dev/blog)

