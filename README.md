# Next Day

Premium personal life management app — Expo SDK 54, React Native, TypeScript, Firebase, dark-first UI.

## Modules

- **Today** — dashboard with live cards
- **Today Focus** — daily priority (custom, task, or goal)
- **Tasks** — due dates, priorities, complete/archive/delete
- **Money** — bills, expenses, monthly summary
- **Growth** — habits (streaks) and goals
- **Notes** — search, tags, pin, archive
- **Reminders** — local daily notifications (More → Reminders)
- **More** — notes entry, reminders, sign out

## Stack

- Expo SDK 54 + React Native + TypeScript
- Firebase Auth + Firestore (Storage prepared, unused in UI)
- React Navigation (tabs + native stacks)
- `expo-notifications` for local reminders only
- No global state library; auth via `AuthProvider` + Firestore listeners

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Fill in values from Firebase Console → Project settings → Your apps.  
   **Do not commit `.env`.** Use placeholders in `.env.example` only.

3. **Firebase Console**

   - Enable Email/Password authentication
   - Create Firestore database
   - Deploy rules: `firebase deploy --only firestore:rules`

4. **Run**

   ```bash
   npm run typecheck
   npx expo start -c
   ```

   Restart Expo after changing `.env`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run typecheck` | TypeScript check |

## Internal beta

See [BETA_RELEASE.md](./BETA_RELEASE.md) for internal beta build steps, reminder testing, and EAS preview APK distribution.

## Manual testing

See [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md) — start with **Internal Beta v1**.

## Security

- Never commit `.env`, service account keys, or secrets.
- `EXPO_PUBLIC_*` values are bundled in the client (normal for Firebase SDKs).
- Protect data with Firestore rules, API key restrictions, and Firebase App Check (recommended before production).
