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
- [ ] Money placeholder tab shows title and subtitle
- [ ] Growth tab opens habit list (not placeholder)
- [ ] Tasks tab opens task list (not placeholder)
- [ ] **Android:** Bottom tabs visible above system navigation (Today, Tasks, Money, Growth, More labels readable)

## Today dashboard

- [ ] Greeting uses display name (or email prefix)
- [ ] Cards: Today's Focus, Tasks Due Today, Bills Due Soon, Habit Progress, Quick Note
- [ ] **Tasks Due Today** shows loading, then live tasks or empty state
- [ ] Overdue pending tasks appear with **Overdue** label
- [ ] Tasks due tomorrow do not appear on Today card
- [ ] Completed/archived tasks do not appear on Today card
- [ ] At most 3 tasks shown; **View all** / **Add task** open Tasks tab (Today filter or new task form)
- [ ] Empty/error states on Tasks Due Today card show **Add task** and/or **Open Tasks**
- [ ] **Habit Progress** shows loading, then live summary or empty state
- [ ] Habit Progress: at most 3 habits; **Add habit** / **Open Growth** navigate correctly
- [ ] Habit Progress empty/error states show **Add habit** and/or **Open Growth**
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

### Tasks data (MVP)

- [ ] Tasks load without requiring Firestore composite indexes (client-side filter/sort on `users/{uid}/tasks`)

**Follow-up (not required for MVP):** Future optimization may add Firestore composite indexes when task volume grows.

## Growth / Habits

- [ ] **Add habit** — title required; optional description; frequency shown as Daily
- [ ] New habit at `users/{uid}/habits/{habitId}` in Firestore Console
- [ ] **Edit habit** — change title/description; save persists
- [ ] **Archive habit** — confirmation required; hidden from active list and Today dashboard
- [ ] No hard delete for habits
- [ ] **Mark done today** — creates check-in at `users/{uid}/habits/{habitId}/checkins/{dateKey}` (doc id = dateKey)
- [ ] Re-tap mark done when already completed today is a no-op (no duplicate check-in)
- [ ] **Undo today** — removes today check-in; streak fields update
- [ ] Streak increments on consecutive daily check-ins
- [ ] Streak resets after a skipped day
- [ ] **bestStreak** recomputes from actual check-ins (undo can lower bestStreak)
- [ ] Archived habits hidden from Growth active list and Today Habit Progress card
- [ ] Weekly completion count uses week starting Monday
- [ ] Growth screen: today summary, weekly summary, active list, loading/error/retry
- [ ] Today dashboard Habit Progress card updates when habits/check-ins change
- [ ] Friendly Firestore errors (no raw `FirebaseError:` text)
- [ ] `npm run typecheck` passes

### Habits data (MVP)

- [ ] Habits and check-ins load without composite indexes (client-side filter on `users/{uid}/habits`)

## Security (Firebase Console)

- [ ] Unauthenticated Firestore read/write denied
- [ ] User A cannot read/write `users/{userB_uid}`
- [ ] User A can read/write own `users/{userA_uid}` document

## Regression

- [ ] No hardcoded user IDs in source
- [ ] `.env` not tracked by git
- [ ] App runs after cold start with persisted session (AsyncStorage auth persistence)
