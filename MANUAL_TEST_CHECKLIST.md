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
- [ ] Growth placeholder tab shows title and subtitle
- [ ] Tasks tab opens task list (not placeholder)
- [ ] Money tab opens Money hub (not placeholder)
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
- [ ] **Bills Due Soon** shows loading, live bills (max 3), or empty state
- [ ] Bills due within 7 days appear; paid bills hidden from card
- [ ] **Add bill** / **Open Money** / **View all** on Bills card navigate correctly
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

## Money

- [ ] **Money tab** — monthly PKR spending summary for current month
- [ ] **Bills due soon** — overdue unpaid, due today, and due within next 7 days
- [ ] Monthly bill overdue this month (e.g. due day 10, today 16, unpaid) shows **Overdue**
- [ ] Monthly bill paid for current month shows next month’s due date (not in due soon until window)
- [ ] **Recent expenses** — latest expenses listed
- [ ] **Add bill** — one-time (due date) and monthly (day 1–31)
- [ ] Amounts stored as `amountMinor` integer in Firestore (not float)
- [ ] `15000` and `15000.50` parse and display correctly (PKR)
- [ ] **Mark paid / unpaid** on bill (monthly resets next calendar month)
- [ ] **Archive bill** (list or edit); archived bills hidden from due soon
- [ ] **Add expense** — category, spent date, optional notes
- [ ] **Edit expense** and **delete** with confirmation
- [ ] Documents at `users/{uid}/bills/{billId}` and `users/{uid}/expenses/{expenseId}`
- [ ] Bills/expenses load without composite indexes (collection snapshot + client filter)
- [ ] Friendly errors; no raw Firebase messages

## Security (Firebase Console)

- [ ] Unauthenticated Firestore read/write denied
- [ ] User A cannot read/write `users/{userB_uid}`
- [ ] User A can read/write own `users/{userA_uid}` document

## Regression

- [ ] No hardcoded user IDs in source
- [ ] `.env` not tracked by git
- [ ] App runs after cold start with persisted session (AsyncStorage auth persistence)
