# Fix Sentry Upload Error for Local Builds

## Problem
Sentry upload fails with "No such file or directory" because bundle/sourcemap files don't exist at expected paths during local builds.

## Solution: Disable Sentry Upload for Local Builds

### Option 1: Comment out Sentry config (Quick Fix)

Edit `android/sentry.properties` and comment out the org/project:

```properties
# Temporarily disabled for local builds
# defaults.org=let-them-connect
# defaults.project=ltc
# auth.token=YOUR_SENTRY_AUTH_TOKEN_HERE
```

This will skip Sentry upload and allow the build to complete.

### Option 2: Use Environment Variable

Set this before building:
```bash
export SENTRY_SKIP_UPLOAD=true
```

### Option 3: Make Upload Non-Fatal (Requires Gradle Config)

If you have access to modify gradle files, you can make the Sentry task continue on error.

## After Build Succeeds

Once your APK is built successfully, you can:
1. Re-enable Sentry upload for CI/CD builds
2. Or keep it disabled for local builds (recommended)

## Note
The `sentry.properties` file is in `.gitignore` (android/ directory is ignored), so your auth token is safe and won't be committed to git.



