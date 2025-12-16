# Local Setup Instructions

## ✅ What's Done on Server
- Fresh app created at `/root/chatwoot-mobile-app-fresh`
- All whitelabeling changes applied
- 16KB plugin added
- Git initialized and pushed to branch: `feat/whitelabel-fresh-start`

## 📥 Steps for Your Local Laptop

### 1. Clone or Pull the New Branch

**If you don't have the repo yet:**
```bash
git clone git@github.com:devangn/chatwoot-mobile-app.git
cd chatwoot-mobile-app
git checkout feat/whitelabel-fresh-start
```

**If you already have the repo:**
```bash
cd chatwoot-mobile-app
git fetch origin
git checkout feat/whitelabel-fresh-start
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Prebuild Android (if needed)
```bash
npx expo prebuild --platform android --clean
```

### 5. Build APK
```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## 📋 What's Included
- ✅ Reference app base (Expo SDK 52, React Native 0.76.9) - **WORKING VERSION**
- ✅ 16KB page size plugin added
- ✅ Whitelabeled: "Let Them Connect"
- ✅ UI changes: Hidden features in login/settings
- ✅ Support link: https://letthemconnect.com

## ⚠️ Important Notes
- This is based on SDK 52 (working reference app)
- 16KB plugin is added but needs testing
- If 16KB requires SDK 54, we'll need to upgrade with compatibility fixes

## 🔄 Git Workflow Going Forward

**All changes go to this branch:**
```bash
git checkout feat/whitelabel-fresh-start
# Make changes
git add .
git commit -m "Your changes"
git push origin feat/whitelabel-fresh-start
```

**To merge to main later:**
```bash
git checkout main
git merge feat/whitelabel-fresh-start
git push origin main
```


