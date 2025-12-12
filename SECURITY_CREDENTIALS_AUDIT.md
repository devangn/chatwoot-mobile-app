# Security Credentials Audit - Chatwoot Mobile App

## ⚠️ CRITICAL: If you suspect a security breach, change ALL credentials listed below immediately.

---

## 1. 🔥 Firebase (Google Cloud Platform)

### Location: `google-services.json`
- **Project ID**: `let-them-connect`
- **Project Number**: `143005579593`
- **API Key**: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` ⚠️ **EXPOSED - Check google-services.json for actual key**
- **Storage Bucket**: `let-them-connect.firebasestorage.app`
- **Android App ID**: `1:143005579593:android:ecd239e074816787814298`

### Actions Required if Breached:
1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Project Settings** → **General** → **Your apps**
3. **Regenerate API Key** for Android app
4. **Download new `google-services.json`**
5. **Replace** `google-services.json` in project root
6. **Revoke old API key** in Google Cloud Console
7. **Check Firebase Storage** for unauthorized access
8. **Review Firebase Authentication** logs for suspicious activity

### iOS Configuration:
- iOS `google-services.json` path: Set via `EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE` env var
- Check iOS Firebase project settings separately

---

## 2. 🐛 Sentry (Error Tracking)

### Location: `android/sentry.properties`
- **Organization**: `let-them-connect`
- **Project**: `ltc`
- **Auth Token**: `sntryu_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` ⚠️ **EXPOSED - Check file for actual token**

### Environment Variables (Runtime):
- `EXPO_PUBLIC_SENTRY_DSN` - Sentry DSN for error reporting
- `EXPO_PUBLIC_SENTRY_ORG_NAME` - Organization name
- `EXPO_PUBLIC_SENTRY_PROJECT_NAME` - Project name

### Actions Required if Breached:
1. **Go to Sentry**: https://sentry.io/
2. **Settings** → **Auth Tokens**
3. **Revoke the exposed token** immediately
4. **Generate new auth token**
5. **Update** `android/sentry.properties`:
   ```properties
   defaults.org=let-them-connect
   defaults.project=ltc
   auth.token=NEW_TOKEN_HERE
   ```
6. **Update** environment variables with new DSN if changed
7. **Review Sentry events** for any unauthorized access

---

## 3. 📊 Analytics (June.so)

### Location: `src/utils/analyticsUtils.ts`
- **Base URL**: `https://api.june.so/api/`
- **SDK Key**: Set via `EXPO_PUBLIC_JUNE_SDK_KEY` environment variable

### Actions Required if Breached:
1. **Go to June.so Dashboard**
2. **Regenerate SDK Key**
3. **Update** `EXPO_PUBLIC_JUNE_SDK_KEY` environment variable
4. **Review analytics data** for anomalies

---

## 4. 🌐 Chatwoot Server Configuration

### Environment Variables:
- `EXPO_PUBLIC_DEFAULT_SERVER_URL` - Default server URL (default: `cw3.letthemconnect.com`)
- `EXPO_PUBLIC_DEFAULT_INSTALLATION_URL` - Default installation URL (default: `https://cw3.letthemconnect.com/`)
- `EXPO_PUBLIC_DEFAULT_WEBSOCKET_URL` - WebSocket URL (default: `wss://cw3.letthemconnect.com/cable`)
- `EXPO_PUBLIC_MINIMUM_CHATWOOT_VERSION` - Minimum required Chatwoot version

### Chatwoot Widget (Optional):
- `EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN` - Website token for Chatwoot widget
- `EXPO_PUBLIC_CHATWOOT_BASE_URL` - Base URL for Chatwoot widget

### Actions Required if Breached:
1. **Change Chatwoot server credentials** (if self-hosted)
2. **Regenerate API tokens** in Chatwoot admin panel
3. **Update environment variables** with new URLs/tokens
4. **Review server logs** for unauthorized access
5. **Change database passwords** if server was compromised

---

## 5. 📱 Expo Application Services (EAS)

### Location: `app.config.ts`
- **EAS Project ID**: `b2042274-3d3e-4c97-9459-6899eda91fe5`
- **Owner**: `letthemconnect`

### Environment Variables:
- `EXPO_PUBLIC_PROJECT_ID` - EAS project ID (can override hardcoded value)

### Actions Required if Breached:
1. **Go to Expo Dashboard**: https://expo.dev/
2. **Account Settings** → **Access Tokens**
3. **Revoke all tokens**
4. **Generate new access tokens**
5. **Review build history** for unauthorized builds
6. **Check app store credentials** (if configured)

---

## 6. 🔐 User Authentication & API

### Chatwoot API Authentication:
- User credentials stored in Redux store (encrypted with Redux Persist)
- API tokens managed by Chatwoot backend
- WebSocket authentication via `pubSubToken`

### Actions Required if Breached:
1. **Force password reset** for all users in Chatwoot admin
2. **Revoke all active sessions** in Chatwoot
3. **Regenerate WebSocket tokens**
4. **Review API access logs**
5. **Check for unauthorized API calls**

---

## 7. 📦 Third-Party Packages (No Direct Credentials)

These packages don't require credential changes but should be updated if compromised:

- **@react-native-firebase/app** & **@react-native-firebase/messaging** - Uses Firebase config
- **@sentry/react-native** - Uses Sentry config
- **@notifee/react-native** - Push notifications (uses Firebase)
- **@chatwoot/react-native-widget** - Uses Chatwoot config

---

## 8. 🔒 Environment Variables Summary

### Required Environment Variables (Set in `.env` or CI/CD):
```
EXPO_PUBLIC_SENTRY_DSN=                    # Sentry DSN
EXPO_PUBLIC_SENTRY_ORG_NAME=              # Sentry organization
EXPO_PUBLIC_SENTRY_PROJECT_NAME=          # Sentry project
EXPO_PUBLIC_JUNE_SDK_KEY=                 # June analytics key
EXPO_PUBLIC_DEFAULT_SERVER_URL=           # Chatwoot server URL
EXPO_PUBLIC_DEFAULT_INSTALLATION_URL=     # Chatwoot installation URL
EXPO_PUBLIC_DEFAULT_WEBSOCKET_URL=        # WebSocket URL
EXPO_PUBLIC_MINIMUM_CHATWOOT_VERSION=     # Minimum version
EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN=       # Widget token (optional)
EXPO_PUBLIC_CHATWOOT_BASE_URL=            # Widget base URL (optional)
EXPO_PUBLIC_YOUTUBE_CHANNEL_URL=          # YouTube URL (optional)
EXPO_PUBLIC_SUPPORT_URL=                  # Support URL (optional)
EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE=     # iOS Firebase config path
EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE= # Android Firebase config path
EXPO_STORYBOOK_ENABLED=                   # Storybook flag
```

---

## 9. 🚨 Immediate Response Checklist

If you suspect a security breach:

- [ ] **Revoke Firebase API Key** and regenerate
- [ ] **Revoke Sentry Auth Token** and regenerate
- [ ] **Change all environment variables** (especially API keys)
- [ ] **Regenerate June Analytics SDK Key**
- [ ] **Review Firebase Console** for unauthorized access
- [ ] **Review Sentry Dashboard** for suspicious events
- [ ] **Check Chatwoot server logs** for unauthorized API calls
- [ ] **Force password reset** for all users
- [ ] **Revoke all active sessions**
- [ ] **Review Expo build history**
- [ ] **Check app store accounts** for unauthorized releases
- [ ] **Update all hardcoded credentials** in code
- [ ] **Rotate database passwords** (if server compromised)
- [ ] **Review git history** for any credential leaks
- [ ] **Enable 2FA** on all service accounts
- [ ] **Audit all third-party integrations**

---

## 10. 📝 Files Containing Credentials

### ⚠️ Files with Exposed Credentials (Need Immediate Review):
1. `google-services.json` - Contains Firebase API key
2. `android/sentry.properties` - Contains Sentry auth token
3. `app.config.ts` - Contains EAS project ID (less sensitive)

### ✅ Files Using Environment Variables (Safer):
- `src/app.tsx` - Uses `EXPO_PUBLIC_SENTRY_DSN`
- `src/utils/analyticsUtils.ts` - Uses `EXPO_PUBLIC_JUNE_SDK_KEY`
- `src/store/settings/settingsSlice.ts` - Uses server URL env vars

---

## 11. 🔐 Best Practices Going Forward

1. **Never commit credentials** to git
2. **Use environment variables** for all sensitive data
3. **Add to `.gitignore`**:
   - `google-services.json` (or use env vars)
   - `android/sentry.properties`
   - `.env` files
4. **Use secret management** in CI/CD (GitHub Secrets, etc.)
5. **Rotate credentials regularly** (every 90 days)
6. **Monitor access logs** for all services
7. **Enable 2FA** on all accounts
8. **Use separate credentials** for dev/staging/production

---

## 12. 📞 Support Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Sentry Support**: https://sentry.io/support/
- **Expo Support**: https://expo.dev/support
- **June Analytics**: Check their dashboard for support

---

**Last Updated**: 2025-12-12
**Next Review**: 2026-03-12 (90 days)

