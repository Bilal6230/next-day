# Next Day — Internal Beta v1

## Purpose

This document describes how to prepare, test, and distribute **Internal Beta v1** of Next Day.

- Internal beta only — for trusted testers and developers.
- **Not** a production or app store release.
- Local reminders only; no remote push notifications in this beta.

## Prerequisites

- Node.js 20+
- npm
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) / [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)
- A [Firebase](https://console.firebase.google.com/) project
- **Email/Password** authentication enabled in Firebase Console
- **Firestore** database created
- `.env` created locally from `.env.example` (never commit `.env`)

## Install and verify

```bash
npm install
npm run typecheck
npx expo start -c
```

Restart Expo after changing `.env`.

## Firebase setup

1. Copy `.env.example` to `.env` and fill in values from Firebase Console → Project settings → Your apps.
2. Enable Email/Password sign-in (Authentication → Sign-in method).
3. Create a Firestore database (production mode recommended for real data).
4. Deploy security rules from this repo:

```bash
firebase login
firebase deploy --only firestore:rules
```

User data must live under `users/{uid}/...`. Rules in `firestore.rules` enforce owner-only access.

## Testing reminders

Use a **physical Android device** first — notification behavior is most reliable there.

1. Open **More → Reminders**.
2. Toggle **Enable reminders** ON → grant notification permission when prompted.
3. Enable one category and set its time **1–2 minutes ahead** of the current time.
4. Save settings.
5. Wait for the local notification at the scheduled time.
6. Disable the category or master toggle → confirm the notification does not repeat at the old schedule.
7. **Sign out** from More → confirm scheduled reminders for that account are cancelled.

**Note:** Android notification behavior can differ between **Expo Go** and **development/preview builds**. Validate reminders on a preview APK before wider distribution.

## Android internal build

Requires an [Expo account](https://expo.dev/signup). First build may prompt for login and project linking.

```bash
eas build --profile preview --platform android
```

- Produces an **APK** for internal distribution (`distribution: internal` in `eas.json`).
- Download the build from the Expo dashboard and install on test devices.
- Test reminders, keyboard behavior, and offline flows on a real device after installing the APK.

## iOS notes

- An **Apple Developer account** is required for physical device installs and TestFlight.
- iOS Simulator can be used for navigation and CRUD smoke tests if available on your machine.
- Wider iOS beta distribution is planned for a later phase.

## Known limitations

- **Local reminders only** — no remote push notifications.
- **No Expo push token** storage or FCM/APNs setup.
- **No account deletion** flow yet.
- **No data export** flow yet.
- Notification body text may be **stale** until the app returns to the foreground and sync runs.
- **Firebase App Check** is not enabled yet (recommended before production).
- **No automated tests** (Jest) in this beta.
- Storage is prepared in code but not used by UI features yet.

## Release steps

1. Run the full [Internal Beta v1 checklist](./MANUAL_TEST_CHECKLIST.md).
2. Fix **blockers only** — no new product features in the finalization pass.
3. Merge the beta finalization branch to `main`.
4. Tag the release, e.g. `internal-beta-v1`.
5. Run `eas build --profile preview --platform android`.
6. Distribute the APK to internal testers with this document and the checklist.
