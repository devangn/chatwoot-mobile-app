# Expo SDK 54 Upgrade - Technical Documentation

## Overview
This document details the technical upgrade from Expo SDK 52 to SDK 54, including all dependency updates, configuration changes, and build requirements.

## Purpose
This documentation provides technical details about what was changed, where it was changed, and why. Use this when:
- Understanding dependency versions
- Troubleshooting build issues
- Planning future upgrades
- Resolving merge conflicts

---

## 1. Core Framework Upgrades

### Expo SDK
- **From:** `~52.0.46`
- **To:** `^54.0.25`
- **Why:** Required for Android API 35 support and 16KB page size compatibility
- **Impact:** Major version upgrade requiring dependency updates

### React & React Native
- **React:** `18.3.1` → `19.1.0`
- **React Native:** `0.76.9` → `0.81.5`
- **Why:** SDK 54 requires React 19 and React Native 0.81+
- **Impact:** Breaking changes in React 19, requires code review

### React DOM
- **From:** `18.3.1`
- **To:** `19.1.0`
- **Why:** Must match React version for web compatibility
- **File:** `package.json`

---

## 2. Expo Module Updates

All Expo modules were updated to SDK 54 compatible versions:

| Package | From | To | File |
|---------|------|-----|------|
| `expo-application` | `~6.0.2` | `~7.0.7` | `package.json` |
| `expo-av` | `~15.0.2` | `~16.0.7` | `package.json` |
| `expo-build-properties` | `~0.13.2` | `~1.0.9` | `package.json` |
| `expo-constants` | `~17.0.8` | `~18.0.10` | `package.json` |
| `expo-dev-client` | `~5.0.20` | `~6.0.18` | `package.json` |
| `expo-device` | `~7.0.3` | `~8.0.9` | `package.json` |
| `expo-file-system` | `~18.0.12` | `~19.0.19` | `package.json` |
| `expo-font` | `~13.0.4` | `~14.0.9` | `package.json` |
| `expo-haptics` | `~14.0.1` | `~15.0.7` | `package.json` |
| `expo-image` | `~2.0.7` | `~3.0.10` | `package.json` |
| `expo-notifications` | `~0.29.14` | `~0.32.13` | `package.json` |
| `expo-splash-screen` | `~0.29.24` | `~31.0.11` | `package.json` |
| `expo-status-bar` | `~2.0.1` | `~3.0.8` | `package.json` |
| `expo-system-ui` | `~4.0.9` | `~6.0.8` | `package.json` |
| `expo-web-browser` | `~14.0.2` | `~15.0.9` | `package.json` |

**Why:** SDK 54 requires updated module versions for compatibility
**Impact:** All Expo modules now use latest APIs and features

---

## 3. React Native Community Packages

| Package | From | To | File |
|---------|------|-----|------|
| `react-native-gesture-handler` | `2.20.2` | `~2.28.0` | `package.json` |
| `react-native-keyboard-controller` | `1.18.6` | `1.18.5` | `package.json` |
| `react-native-pager-view` | `6.5.1` | `6.9.1` | `package.json` |
| `react-native-reanimated` | `3.16.7` | `~4.1.1` | `package.json` |
| `react-native-safe-area-context` | `4.12.0` | `~5.6.0` | `package.json` |
| `react-native-screens` | `4.4.0` | `~4.16.0` | `package.json` |
| `react-native-svg` | `15.8.0` | `15.12.1` | `package.json` |
| `react-native-webview` | `13.12.5` | `13.15.0` | `package.json` |
| `@react-native-community/datetimepicker` | `8.2.0` | `8.4.4` | `package.json` |
| `@react-native-community/slider` | `4.5.5` | `5.0.1` | `package.json` |

**Why:** Compatibility with React Native 0.81 and new architecture
**Impact:** Better performance, new features, bug fixes

---

## 4. Critical Dependency Updates

### React Native Reanimated
- **From:** `3.16.7`
- **To:** `~4.1.1`
- **Why:** Required for new architecture support
- **Impact:** Breaking changes, requires new architecture enabled

### React Native Worklets
- **Added:** `react-native-worklets-core@^1.6.2`
- **Added:** `react-native-worklets@^0.6.1`
- **Why:** Required by Reanimated v4 for new architecture
- **Impact:** New dependency, requires Babel plugin configuration

### Sentry
- **From:** `~6.10.0`
- **To:** `~7.2.0`
- **Why:** Compatibility with React Native 0.81
- **Impact:** Updated error tracking, may require config updates

---

## 5. Configuration Changes

### app.config.ts

#### New Architecture Enabled
```typescript
newArchEnabled: true  // Changed from false
```
**Why:** Required for Reanimated v4 and Worklets
**Impact:** All native modules must support new architecture

#### Target SDK Version
```typescript
targetSdkVersion: 35  // Changed from 34
```
**Why:** Google Play Store requirement (must target API 35)
**Impact:** App must comply with Android 15 requirements

#### Build Properties
```typescript
android: {
  minSdkVersion: 24,
  compileSdkVersion: 35,
  targetSdkVersion: 35,
  enableProguardInReleaseBuilds: true,
}
```
**Why:** Android 15 compatibility and optimization
**Impact:** Better performance, smaller app size

### .npmrc
**Added:**
```
legacy-peer-deps=true
```
**Why:** Resolve peer dependency conflicts with React 19
**Impact:** Allows installation despite peer dependency warnings

---

## 6. New Files Created

### Config Plugins
1. **`with-16kb-page-size.js`**
   - Purpose: Handle 16KB page size support (currently no-op)
   - Status: Placeholder for future implementation
   - Location: Root directory

2. **`with-document-picker-fix.js`**
   - Purpose: Attempt to fix document picker new architecture compatibility
   - Status: May not work, consider migrating to expo-document-picker
   - Location: Root directory

### Documentation
- `docs/` folder with multiple documentation files
- All documentation in feature branch

---

## 7. Build Requirements

### Android
- **Min SDK:** 24
- **Target SDK:** 35
- **Compile SDK:** 35
- **Build Tools:** 36.0.0
- **NDK:** 27.1.12297006
- **Kotlin:** 2.1.20

### EAS Build
- Profile: `production`
- Auto-increment version code: Enabled
- Sentry integration: Required (environment variables needed)

---

## 8. Known Issues & Workarounds

### Issue: react-native-document-picker
- **Problem:** Not compatible with new architecture
- **Error:** `GuardedResultAsyncTask` not found
- **Status:** Build failing
- **Solution:** Migrate to `expo-document-picker` (recommended)

### Issue: react-native-audio-recorder-player
- **Problem:** Deprecated, not fully compatible
- **Solution:** Updated to `5.0.0-rc.1` (temporary)
- **Future:** Consider migrating to `react-native-nitro-sound`

### Issue: Peer Dependencies
- **Problem:** React 19 conflicts
- **Solution:** `legacy-peer-deps=true` in `.npmrc`

---

## 9. Migration Checklist

- [x] Update Expo SDK to 54
- [x] Update React to 19
- [x] Update React Native to 0.81
- [x] Update all Expo modules
- [x] Enable new architecture
- [x] Update target SDK to 35
- [x] Add worklets dependencies
- [x] Configure npm for peer dependencies
- [ ] Fix document picker compatibility
- [ ] Test all features
- [ ] Update CI/CD if needed

---

## 10. Files Modified

### Configuration Files
- `package.json` - All dependency updates
- `package-lock.json` - Lock file updates
- `app.config.ts` - Config changes
- `.npmrc` - Peer dependency resolution

### Source Files
- `src/screens/auth/LoginScreen.tsx` - UI changes
- `src/screens/settings/SettingsScreen.tsx` - UI changes

### New Files
- `with-16kb-page-size.js`
- `with-document-picker-fix.js`
- `docs/` folder with documentation

---

## References
- [Expo SDK 54 Release Notes](https://expo.dev/changelog/2024/11-18-sdk-54)
- [React Native 0.81 Release Notes](https://reactnative.dev/blog)
- [New Architecture Documentation](https://reactnative.dev/docs/the-new-architecture/landing-page)

