# Fix CMake Clean Error

## Problem
`./gradlew clean` fails with CMake errors about missing codegen directories. This happens because the clean task tries to remove native build artifacts before codegen has run.

## Solution

### Option 1: Skip Clean and Build Directly (Recommended)

Instead of cleaning first, just build directly:

```bash
cd android
./gradlew assembleRelease
```

The build process will generate the codegen files as needed. This is the recommended approach.

### Option 2: Delete .cxx Directory Manually

If you really need to clean, delete the CMake cache manually:

```bash
cd android
rm -rf app/.cxx
./gradlew clean
./gradlew assembleRelease
```

### Option 3: Regenerate Native Code First

If the codegen directories are completely missing:

```bash
# From project root
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

## Why This Happens

With React Native's new architecture, native modules need codegen to generate native code. The `clean` task tries to remove build artifacts, but CMake expects these directories to exist during the clean process. Building directly avoids this issue because Gradle will generate what's needed in the correct order.

## For Sentry Upload

Once the build succeeds, the bundle and sourcemap files will be generated, and Sentry upload should work (if you've uncommented the sentry.properties file).



