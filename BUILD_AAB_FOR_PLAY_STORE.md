# Build AAB for Play Store Upload

## Build Command

From the project root, run:

```bash
cd android
./gradlew bundleRelease
```

## Output Location

The AAB file will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Signing

The AAB will be automatically signed using the keystore configured in your `android/app/build.gradle` file (if signing is configured).

### If Signing is Not Configured

If you need to sign manually or configure signing:

1. **Check if signing is configured:**
   ```bash
   cd android
   grep -A 10 "signingConfigs" app/build.gradle
   ```

2. **If not configured, you'll need to:**
   - Create a keystore (if you don't have one)
   - Configure signing in `android/app/build.gradle`
   - Or use EAS Build which handles signing automatically

### Using EAS Build (Recommended)

If you're using Expo Application Services (EAS), you can build a signed AAB directly:

```bash
# From project root
eas build -p android --profile production
```

This will:
- Build a signed AAB
- Upload it to EAS servers
- Handle all signing automatically
- Provide download link

## Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to "Production" → "Create new release"
4. Upload the `app-release.aab` file
5. Fill in release notes
6. Review and roll out

## File Size

AAB files are typically smaller than APKs because Google Play generates optimized APKs for each device configuration.

## Notes

- AAB is the required format for new apps on Google Play (since August 2021)
- The AAB contains all code and resources, but Google Play generates device-specific APKs
- Make sure your app version is incremented in `app.config.ts` before building

