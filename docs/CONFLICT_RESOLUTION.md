# Conflict Resolution Guide

## Overview
This guide helps resolve merge conflicts when pulling updates from master/develop branch into the `feat/expo-sdk54-new-architecture` branch.

## Purpose
Step-by-step instructions for handling conflicts while preserving SDK 54 upgrade and new architecture changes.

---

## 1. Pre-Merge Checklist

Before pulling from master:
- [ ] Commit all current changes
- [ ] Create backup branch: `git branch backup-before-merge`
- [ ] Review master/develop changes in GitHub/GitLab
- [ ] Identify potential conflict areas

---

## 2. Merge Process

### Step 1: Update Base Branch
```bash
git checkout develop
git pull origin develop
```

### Step 2: Merge into Feature Branch
```bash
git checkout feat/expo-sdk54-new-architecture
git merge develop
```

### Step 3: Resolve Conflicts
Follow sections below for each file type.

---

## 3. File-Specific Conflict Resolution

### 3.1 package.json

#### High Priority Conflicts (Keep Our Versions)

**Core Framework:**
```json
// KEEP OUR VERSIONS
"expo": "^54.0.25",           // Don't downgrade
"react": "19.1.0",            // Don't downgrade
"react-native": "0.81.5",     // Don't downgrade
"react-dom": "19.1.0",        // Don't downgrade
```

**New Architecture Required:**
```json
// KEEP OUR VERSIONS
"react-native-reanimated": "~4.1.1",
"react-native-worklets": "^0.6.1",
"react-native-worklets-core": "^1.6.2",
```

**Updated for SDK 54:**
```json
// KEEP OUR VERSIONS (All Expo modules)
"expo-application": "~7.0.7",
"expo-av": "~16.0.7",
// ... all other expo-* packages
```

#### Merge Strategy

1. **For packages we updated:**
   - Keep our version (SDK 54 compatible)
   - Check if master's version is newer
   - If newer, verify SDK 54 compatibility before merging

2. **For packages we didn't touch:**
   - Accept master's version
   - Test after merge

3. **For new packages from master:**
   - Add them
   - Verify SDK 54 compatibility
   - Test functionality

#### Example Conflict Resolution

```json
<<<<<<< HEAD
  "expo": "^54.0.25",
  "react": "19.1.0",
=======
  "expo": "~52.0.46",
  "react": "18.3.1",
>>>>>>> develop
```

**Resolution:**
```json
  "expo": "^54.0.25",  // Keep our version (SDK 54)
  "react": "19.1.0",   // Keep our version (required for SDK 54)
```

---

### 3.2 app.config.ts

#### Keep Our Changes

**New Architecture:**
```typescript
newArchEnabled: true  // MUST KEEP
```

**Target SDK:**
```typescript
targetSdkVersion: 35  // MUST KEEP (Google Play requirement)
```

**Plugins:**
```typescript
plugins: [
  // ... other plugins
  './with-16kb-page-size.js',
  './with-document-picker-fix.js',
]
```

#### Merge Strategy

1. **Keep our `newArchEnabled: true`**
2. **Keep our `targetSdkVersion: 35`**
3. **Merge any new plugins from master**
4. **Keep our custom plugins**

#### Example Conflict

```typescript
<<<<<<< HEAD
  newArchEnabled: true,
  targetSdkVersion: 35,
=======
  newArchEnabled: false,
  targetSdkVersion: 34,
>>>>>>> develop
```

**Resolution:**
```typescript
  newArchEnabled: true,      // Keep our version
  targetSdkVersion: 35,      // Keep our version
```

---

### 3.3 Source Files (UI Changes)

#### Files We Modified
- `src/screens/auth/LoginScreen.tsx`
- `src/screens/settings/SettingsScreen.tsx`

#### Merge Strategy

1. **Review master's changes:**
   - What did they change?
   - Does it conflict with our UI customizations?

2. **Manual merge:**
   - Keep our UI customizations (branding, removed elements)
   - Merge any bug fixes or new features from master
   - Test UI after merge

3. **If master changed same lines:**
   - Compare changes
   - Manually integrate both sets of changes
   - Test thoroughly

#### Example: LoginScreen.tsx

**Our Changes:**
- Removed connection status text
- Added "Let Them Connect" branding
- Removed forgot password link

**If Master Changed:**
- Bug fix in form validation
- New feature for SSO login

**Resolution:**
- Keep our UI customizations
- Merge master's bug fixes/features
- Ensure both work together

---

### 3.4 Configuration Files

#### .npmrc
```bash
# KEEP OUR VERSION
legacy-peer-deps=true
```

**Reason:** Required for React 19 peer dependency resolution

#### .gitignore
- Merge both versions
- Keep entries from both branches

---

### 3.5 New Files (No Conflicts)

These files don't exist in master, so no conflicts:
- `with-16kb-page-size.js`
- `with-document-picker-fix.js`
- `docs/` folder and all documentation

**Action:** No action needed, files stay in branch

---

## 4. Post-Merge Steps

### Step 1: Update Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Clear Caches
```bash
npx expo start --clear
```

### Step 3: Rebuild Native Code
```bash
npx expo prebuild --clean
```

### Step 4: Test Build
```bash
npx eas build -p android --profile production --local
# Or test on device
```

### Step 5: Verify Functionality
- [ ] App builds successfully
- [ ] No runtime errors
- [ ] UI customizations still work
- [ ] New features from master work
- [ ] Animations work (Reanimated)
- [ ] All screens load correctly

---

## 5. Common Conflict Scenarios

### Scenario 1: Master Updated Same Dependency

**Situation:** Master updated `expo-av` to a different version

**Resolution:**
1. Check if master's version is SDK 54 compatible
2. If yes, use master's version (might be newer)
3. If no, keep our version
4. Test after merge

### Scenario 2: Master Added New Dependency

**Situation:** Master added a new package

**Resolution:**
1. Add the package
2. Verify it's compatible with SDK 54
3. Check if it requires new architecture
4. Test functionality

### Scenario 3: Master Changed UI We Modified

**Situation:** Master changed LoginScreen.tsx

**Resolution:**
1. Compare changes line by line
2. Keep our UI customizations
3. Merge master's bug fixes/features
4. Manually integrate if needed
5. Test UI thoroughly

### Scenario 4: Master Updated Config We Changed

**Situation:** Master changed app.config.ts

**Resolution:**
1. Keep our critical changes:
   - `newArchEnabled: true`
   - `targetSdkVersion: 35`
2. Merge master's other config changes
3. Ensure plugins array includes our custom plugins

---

## 6. Rollback Plan

If merge causes issues:

```bash
# Restore from backup
git checkout backup-before-merge
git branch -D feat/expo-sdk54-new-architecture
git checkout -b feat/expo-sdk54-new-architecture
```

Or reset to before merge:
```bash
git reset --hard HEAD~1  # If merge commit is last
```

---

## 7. Testing Checklist

After resolving conflicts:

- [ ] Dependencies install without errors
- [ ] App builds successfully
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] App runs on device/emulator
- [ ] All screens load
- [ ] UI customizations work
- [ ] New features from master work
- [ ] Animations work
- [ ] No console errors
- [ ] No crashes

---

## 8. Getting Help

If conflicts are too complex:

1. **Document the conflict:**
   - Which files?
   - What are the conflicting changes?
   - What's the goal?

2. **Create a backup:**
   - Commit current state
   - Create backup branch

3. **Ask for assistance:**
   - Share conflict details
   - Share backup branch
   - Explain what you tried

---

## 9. Best Practices

### Before Merging
- Review master's changes
- Understand what changed
- Plan merge strategy
- Create backup

### During Merging
- Resolve one file at a time
- Test after each major conflict resolution
- Document complex resolutions
- Commit frequently

### After Merging
- Test thoroughly
- Fix any issues immediately
- Update documentation if needed
- Don't push until tested

---

## 10. Quick Reference

### Always Keep
- `expo@^54.0.25`
- `react@19.1.0`
- `react-native@0.81.5`
- `newArchEnabled: true`
- `targetSdkVersion: 35`
- UI customizations

### Always Merge
- New features from master
- Bug fixes from master
- New dependencies (if compatible)
- Documentation updates

### Test After
- Every merge
- Dependency updates
- Config changes
- Source file changes

---

## References
- See `docs/SDK54_UPGRADE.md` for technical details
- See `docs/NEW_ARCHITECTURE.md` for architecture details
- See `docs/DEPENDENCY_UPDATES.md` for dependency versions

