# Next Day — Manual test checklist

Use this after configuring `.env` and deploying `firestore.rules`.

## Environment & launch

- [ ] App shows **Firebase setup required** when `.env` is missing or incomplete
- [ ] App loads splash/loading, then auth or main shell when configured
- [ ] Dark theme appears on splash, auth, and main screens

## Authentication

- [ ] **Register** — validation errors for empty/invalid email, short password, mismatched passwords
- [ ] **Register** — successful signup navigates to main tabs
- [ ] Firestore document created at `users/{uid}` with `email`, `displayName`, timestamps
- [ ] **Login** — validation for empty fields
- [ ] **Login** — wrong password shows friendly error (not raw Firebase code)
- [ ] **Login** — correct credentials open main app
- [ ] **Forgot password** — invalid email validation
- [ ] **Forgot password** — success message after submit (no email enumeration leak in copy)
- [ ] **Sign out** (More tab) — returns to login

## Navigation

- [ ] Auth stack: Login ↔ Register ↔ Forgot password
- [ ] Bottom tabs visible when signed in: Today, Tasks, Money, Growth, More
- [ ] Money and Growth placeholder tabs show title and subtitle
- [ ] Tasks tab opens task list (not placeholder)

## Today dashboard

- [ ] Greeting uses display name (or email prefix)
- [ ] Cards: Today's Focus, Tasks Due Today, Bills Due Soon, Habit Progress, Quick Note
- [ ] **Tasks Due Today** shows loading, then live tasks or empty state
- [ ] Overdue pending tasks appear with **Overdue** label
- [ ] Tasks due tomorrow do not appear on Today card
- [ ] Completed/archived tasks do not appear on Today card
- [ ] At most 3 tasks shown; **View all** opens Tasks tab with Today filter
- [ ] Other placeholder cards still show empty states
- [ ] Scroll works on smaller screens

## Tasks

- [ ] **Add task** — title required; optional notes; priority; due date chips / picker
- [ ] New task appears in list at `users/{uid}/tasks/{taskId}` in Firestore Console
- [ ] **Edit task** — change title, notes, priority, due date; save persists
- [ ] **Complete** — toggle marks completed; appears under Completed filter
- [ ] **Incomplete** — toggle again returns to pending
- [ ] **Archive** — task moves to Archived filter (from list or edit screen)
- [ ] **Delete permanently** — confirmation required; document removed from Firestore
- [ ] **All** filter — pending and completed (not archived)
- [ ] **Today** filter — pending with due date today or earlier (overdue); no undated tasks
- [ ] **Completed** / **Archived** filters behave correctly
- [ ] Empty states per filter
- [ ] Loading and error states; **Retry** works after error
- [ ] Friendly Firestore errors (no raw `FirebaseError:` text)
- [ ] `npm run typecheck` passes

### Firestore composite indexes (Tasks)

Create in Firebase Console when the app logs an index URL (collection: `users/{userId}/tasks`):

| Use | Fields |
|-----|--------|
| **Today** / **Tasks Due Today** | `status` Asc, `dueDateKey` Asc, `createdAt` Desc |
| **All** | `status` Asc, `updatedAt` Desc |
| **Completed** | `status` Asc, `updatedAt` Desc |
| **Archived** | `status` Asc, `updatedAt` Desc |

Today queries use `dueDateKey >= '0000-00-00'` and `dueDateKey <= today` so undated tasks are excluded server-side.

## Security (Firebase Console)

- [ ] Unauthenticated Firestore read/write denied
- [ ] User A cannot read/write `users/{userB_uid}`
- [ ] User A can read/write own `users/{userA_uid}` document

## Regression

- [ ] No hardcoded user IDs in source
- [ ] `.env` not tracked by git
- [ ] App runs after cold start with persisted session (AsyncStorage auth persistence)
