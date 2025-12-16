# Fresh Start Plan - Whitelabeled App with 16KB Support

## Current Status
- ✅ Copied reference app to `/root/chatwoot-mobile-app-fresh`
- ✅ Added 16KB plugin
- ✅ Updated app name, package, and URLs for whitelabeling
- ⏳ Need to upgrade to SDK 54 (for 16KB) with compatibility fixes
- ⏳ Apply UI whitelabeling changes
- ⏳ Remove Sentry (optional)

## Next Steps

### 1. Upgrade to SDK 54 (with compatibility fixes)
- Update Expo to ^54.0.25
- Update React to 19.1.0
- Update React Native to 0.81.5
- Keep: FlashList ^1.7.3 (not v2)
- Keep: Reanimated ^3.16.7 (not v4)
- Keep: newArchEnabled: false
- Remove: worklets dependencies

### 2. Apply UI Whitelabeling
- Login screen: Already clean (no connection status, forgot password, change URL/language)
- Settings screen: Hide Set Availability, Change Language, Switch Account
- Settings screen: Update support link to https://letthemconnect.com
- Settings screen: Change version text to "Let Them Connect"

### 3. Git Management Strategy
- Create new branch: `feat/whitelabel-fresh-start`
- Or: Replace current branch with fresh app
- All changes go to this branch
- Test thoroughly before merging to main

## Git Management Going Forward

**Option 1: New Branch (Recommended)**
```bash
cd /root/chatwoot-mobile-app-fresh
git init
git add .
git commit -m "Initial commit: Fresh start from reference app"
git remote add origin <your-repo-url>
git push -u origin feat/whitelabel-fresh-start
```

**Option 2: Replace Current Branch**
```bash
# Backup current work
git branch backup-old-approach

# Replace with fresh app
rm -rf /root/chatwoot-mobile-app/*
cp -r /root/chatwoot-mobile-app-fresh/* /root/chatwoot-mobile-app/
git add -A
git commit -m "Fresh start: Reference app + 16KB + whitelabeling"
```

**Recommendation:** Use Option 1 - keep current work as backup, start fresh branch.


