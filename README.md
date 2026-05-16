# Next Day

Premium React Native app foundation — Expo, TypeScript, Firebase, and React Navigation with a dark-first UI.

## Stack

- **Expo** (SDK 54) + **React Native** + **TypeScript**
- **Firebase** — Auth, Firestore, Storage (prepared)
- **React Navigation** — native stack + bottom tabs
- No global state library; auth state via `AuthProvider` + Firebase listeners

## Project structure

```
src/
  app/           Navigation, providers, shared app screens
  features/      Feature modules (auth, today, …)
  shared/        Reusable UI + theme + utilities
  firebase/      Config, auth, Firestore, storage helpers
```

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) or a development build
- A [Firebase](https://console.firebase.google.com/) project

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in values from Firebase Console → Project settings → Your apps → SDK setup.

3. **Firebase Console**

   - Enable **Email/Password** sign-in (Authentication → Sign-in method).
   - Create a **Firestore** database (production mode recommended).
   - Deploy security rules from `firestore.rules` (see below).

4. **Run the app**

   ```bash
   npx expo start
   ```

   Restart Expo after changing `.env`.

## Firestore rules

Rules live in `firestore.rules`. Users may only read/write `users/{theirUid}` and subcollections.

```bash
# One-time: firebase login && firebase init firestore (select this project)
firebase deploy --only firestore:rules
```

## Security notes

- Do **not** commit `.env` or service account keys.
- `EXPO_PUBLIC_*` values are included in the client bundle (normal for Firebase mobile/web SDKs).
- Restrict abuse with **Firestore rules**, **API key restrictions** (Google Cloud Console), and **Firebase App Check** (recommended before production).
- Money features will use **integer cents** — never store currency as floats.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm start`    | Start Expo dev server    |
| `npm run android` | Open on Android     |
| `npm run ios`  | Open on iOS              |

## Manual testing

See [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md).

## Why these UI choices?

Built-in React Native primitives only — no extra UI kit. That keeps bundle size small, avoids style conflicts, and matches a custom premium dark theme without fighting a third-party design system.
