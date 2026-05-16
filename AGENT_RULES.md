# Agent rules — Next Day

Rules for all Cursor, Codex, and other coding agents working in this repository.

## Project

- **This is an existing app.** Do not recreate the project, reset Firebase, or replace the folder structure.
- **App name:** Next Day — a premium personal life management app.
- **Stack:** Expo SDK 54, React Native, TypeScript, Firebase Authentication, Cloud Firestore (Storage prepared when needed).

## Data and security

- **User data paths:** All user-owned data must live under `users/{uid}/...` (profile at `users/{uid}`, subcollections beneath it).
- **Never use public Firestore rules** (no unauthenticated or global read/write).
- **Never hardcode user IDs** — always use the authenticated user's `uid`.
- **Never commit** `.env`, service account keys, or real Firebase/private secrets.
- **Do not add** real project IDs to `.firebaserc` unless the user explicitly approves.

## How to work

- **One feature at a time.** Do not build unrelated features in the same change.
- **Inspect first:** Before implementing any feature, read the existing structure, patterns, and related files.
- **Keep changes minimal and reviewable.** No broad refactors unless explicitly requested.
- **Do not add unnecessary libraries** (no new UI kits, no global state libraries unless approved).
- **Do not redesign navigation or UI** unless the task asks for it.
- **Preserve premium dark-first UI** — match existing theme and shared components.

## After every change

Provide:

1. **Changed files** — list with brief reason per file.
2. **Manual test checklist** — concrete steps the user can run in the app.

## References

- Versioned Expo docs: https://docs.expo.dev/versions/v54.0.0/
- Repo checklist: `MANUAL_TEST_CHECKLIST.md`
- Firestore rules: `firestore.rules` (deploy via Firebase CLI; see `firebase.json`)
