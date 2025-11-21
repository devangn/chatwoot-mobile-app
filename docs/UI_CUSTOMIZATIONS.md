# UI Customizations - Functional/Flow Changes

## Overview
This document describes the functional and user flow changes made to the application UI. These changes affect how users interact with the app and what features are visible.

## Purpose
This documentation is for functional reference - when asking about user flows or UI behavior, refer to this document to understand what has been changed and why.

---

## 1. Settings Screen Changes

### What Changed
**File:** `src/screens/settings/SettingsScreen.tsx`

**Removed Menu Items:**
- "Set Availability" option
- "Change Language" option  
- "Switch Account" option

**What Remains:**
- Only "Notifications" option is visible under "Preferences" section

### Why
- Customization request to simplify the settings menu
- Focus on essential preferences only
- Reduce UI clutter

### User Flow Impact
- Users can no longer change availability status from settings
- Users can no longer change language from settings
- Users can no longer switch accounts from settings
- Users can still access notification preferences

### How It Works
The `preferencesList` array in `SettingsScreen.tsx` was modified to only include the notifications option. The other menu items were removed from the list.

---

## 2. Login Screen Changes

### What Changed
**File:** `src/screens/auth/LoginScreen.tsx`

**Removed Elements:**
1. Connection status text: "You are connected to cw3.letthemconnect.com"
2. "Forgot your password?" link
3. "Change language" link

**Added Elements:**
1. New title: "Let Them Connect" (main title)
2. New subtitle: "Customer Intelligence Platform" (beside logo)
3. Added spacing between password field and "Sign In" button

**Layout Change:**
- Logo and title/subtitle are now in a horizontal layout (flex-row)
- Logo on the left, text content on the right

### Why
- Branding customization: "Let Them Connect" branding
- Simplified login experience
- Remove unnecessary links
- Better visual hierarchy with title and subtitle

### User Flow Impact
- Users see "Let Them Connect" branding on login
- Users cannot access "Forgot Password" from login screen
- Users cannot change language from login screen
- Cleaner, more focused login experience
- Better spacing improves usability

### How It Works
1. **Logo Section:** Modified to use `flex-row` layout with logo image and text container side-by-side
2. **Title/Subtitle:** Added `Animated.Text` components for "Let Them Connect" (title) and "Customer Intelligence Platform" (subtitle)
3. **Removed Elements:** Commented out or removed the connection status text, forgot password link, and language change link
4. **Spacing:** Wrapped the Sign In button in a `View` with `pt-6` (padding-top) for spacing

---

## Summary of Functional Changes

| Screen | Change Type | Impact |
|--------|------------|--------|
| Settings | Removed features | 3 menu options removed, only Notifications remains |
| Login | UI redesign | New branding, removed links, improved spacing |

---

## Future Reference

When asking about:
- **Settings menu options** → Check this document for what's available
- **Login screen appearance** → Check branding and removed elements
- **User flows** → All flow changes are documented here
- **Feature visibility** → What users can/cannot access

---

## Notes
- These are UI/UX customizations, not technical architecture changes
- All changes are in the respective screen component files
- No backend or API changes required
- Changes are purely frontend/UI layer

