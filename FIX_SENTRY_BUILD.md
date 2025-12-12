# Fix Sentry Build Error

## Problem
The build is failing because Sentry is trying to upload source maps but the organization ID is missing:
```
error: An organization ID or slug is required (provide with --org)
```

## Solution Options

### Option 1: Disable Sentry Upload for Local Builds (Recommended)

Create `android/sentry.properties` file with:
```properties
# Disable Sentry upload for local builds
defaults.project=
defaults.org=
```

Or create an empty file to skip uploads:
```bash
touch android/sentry.properties
```

### Option 2: Configure Sentry for Local Builds

If you want to upload source maps, create `android/sentry.properties` with:
```properties
defaults.org=YOUR_SENTRY_ORG_SLUG
defaults.project=YOUR_SENTRY_PROJECT_NAME
auth.token=YOUR_SENTRY_AUTH_TOKEN
```

You can find these values:
- Organization slug: From your Sentry dashboard URL or `app.config.ts` env vars
- Project name: From `EXPO_PUBLIC_SENTRY_PROJECT_NAME` env var
- Auth token: Generate from Sentry Settings > Auth Tokens

### Option 3: Set Environment Variables

Set these before building:
```bash
export EXPO_PUBLIC_SENTRY_ORG_NAME=your-org-slug
export EXPO_PUBLIC_SENTRY_PROJECT_NAME=your-project-name
```

## Quick Fix (Disable Upload)

Run this in your project root:
```bash
mkdir -p android
echo "# Sentry disabled for local builds" > android/sentry.properties
```

Then rebuild:
```bash
cd android
./gradlew assembleRelease
```



