#!/bin/bash

# Script to help set up Android SDK path for local.properties
# Run this on your NEW machine after you know the SDK path

echo "=========================================="
echo "Android SDK Setup Helper"
echo "=========================================="
echo ""
echo "STEP 1: Find your Android SDK path"
echo "-----------------------------------"
echo ""
echo "On your WORKING laptop, run one of these:"
echo ""
echo "  # Check environment variables:"
echo "  echo \$ANDROID_HOME"
echo "  echo \$ANDROID_SDK_ROOT"
echo ""
echo "  # Check common macOS location:"
echo "  ls -la ~/Library/Android/sdk"
echo ""
echo "  # Or check Android Studio:"
echo "  # Android Studio > Preferences > Appearance & Behavior > System Settings > Android SDK"
echo ""
echo ""
echo "STEP 2: Create local.properties file"
echo "-----------------------------------"
echo ""
echo "Once you have the SDK path, run this on your NEW machine:"
echo ""
echo "  # Replace /path/to/android/sdk with your actual SDK path"
echo "  mkdir -p android"
echo "  echo 'sdk.dir=/path/to/android/sdk' > android/local.properties"
echo ""
echo ""
echo "Example (macOS default):"
echo "  echo 'sdk.dir=/Users/yourusername/Library/Android/sdk' > android/local.properties"
echo ""
echo ""
echo "STEP 3: Verify the file was created correctly"
echo "-----------------------------------"
echo "  cat android/local.properties"
echo ""





