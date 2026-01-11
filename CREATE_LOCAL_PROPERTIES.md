# How to Fix Android SDK Location Error

## Quick Fix

The error occurs because Gradle can't find your Android SDK. You need to create a `local.properties` file in the `android/` directory.

## Step-by-Step Solution

### Option 1: If Android Studio is installed on the NEW machine

1. **Find your Android SDK location:**
   - Open Android Studio
   - Go to: **Android Studio > Preferences** (or **Settings** on Windows/Linux)
   - Navigate to: **Appearance & Behavior > System Settings > Android SDK**
   - Copy the **Android SDK Location** path (usually something like `/Users/yourusername/Library/Android/sdk`)

2. **Create the local.properties file:**
   ```bash
   # Make sure you're in the project root
   cd /Users/diptinathwani/Documents/chatwoot-mobile-app
   
   # Create the android directory if it doesn't exist
   mkdir -p android
   
   # Create local.properties with your SDK path
   echo "sdk.dir=/Users/yourusername/Library/Android/sdk" > android/local.properties
   ```
   Replace `/Users/yourusername/Library/Android/sdk` with the actual path from Android Studio.

### Option 2: If you want to use the same SDK path from your WORKING laptop

1. **On your WORKING laptop, find the SDK path:**
   ```bash
   # Check environment variable
   echo $ANDROID_HOME
   
   # Or check local.properties
   cat android/local.properties | grep sdk.dir
   
   # Or check common macOS location
   ls -la ~/Library/Android/sdk
   ```

2. **On your NEW machine, create local.properties:**
   ```bash
   # Make sure you're in the project root
   cd /Users/diptinathwani/Documents/chatwoot-mobile-app
   
   # Create the android directory if it doesn't exist
   mkdir -p android
   
   # Create local.properties with the SDK path from your working laptop
   echo "sdk.dir=/path/from/working/laptop" > android/local.properties
   ```

### Option 3: Set ANDROID_HOME environment variable (Alternative)

Instead of creating `local.properties`, you can set the environment variable:

```bash
# Add to your ~/.zshrc or ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Then reload your shell
source ~/.zshrc  # or source ~/.bash_profile
```

## Verify the Fix

After creating `local.properties`, verify it:

```bash
cat android/local.properties
```

You should see:
```
sdk.dir=/path/to/your/android/sdk
```

## Common macOS SDK Locations

- Default: `~/Library/Android/sdk` or `/Users/yourusername/Library/Android/sdk`
- Custom: Check Android Studio settings

## Next Steps

After creating `local.properties`, try building again:
```bash
npm run android
# or
npx expo run:android
```





