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
- [ ] Tasks tab opens task list (not placeholder)
- [ ] Money tab opens Money hub (not placeholder)
- [ ] Growth tab shows **Habits** and **Goals** sections (not placeholder)
- [ ] More → **Notes** opens notes list; sign out still works from More home
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
- [ ] **Habit Progress** shows loading, then live summary or empty state
- [ ] Habit Progress: at most 3 habits; **Add habit** / **Open Growth** navigate correctly
- [ ] Habit Progress empty/error states show **Add habit** and/or **Open Growth**
- [ ] **Quick Note** shows loading, pinned/latest active note, or empty state
- [ ] Quick Note: tap preview opens edit; **Add note** / **Open Notes** navigate to More stack
- [ ] Archived notes never appear on Quick Note card
- [ ] Today's Focus placeholder card still shows empty state
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
- [ ] Streak resets after a skipped day (latest check-in before yesterday → **currentStreak** 0; **bestStreak** unchanged from history)
- [ ] Archiving a habit removes its check-ins from weekly/today counts immediately
- [ ] **bestStreak** recomputes from actual check-ins (undo can lower bestStreak)
- [ ] Archived habits hidden from Growth active list and Today Habit Progress card
- [ ] Weekly completion count uses week starting Monday
- [ ] Growth screen: today summary, weekly summary, active list, loading/error/retry
- [ ] Today dashboard Habit Progress card updates when habits/check-ins change
- [ ] Friendly Firestore errors (no raw `FirebaseError:` text)

### Habits data (MVP)

- [ ] Habits and check-ins load without composite indexes (client-side filter on `users/{uid}/habits`)

## Notes

- [ ] **More → Notes** opens list with search and Active / Archived filters
- [ ] **Sign out** from More home still works
- [ ] **Add note** — title only (body optional); doc at `users/{uid}/notes/{noteId}`
- [ ] **Add note** with body and comma-separated tags (normalized: trim, lowercase, dedupe)
- [ ] More than 10 tags shows **Maximum 10 tags allowed** (not silently dropped)
- [ ] Tag longer than 24 chars shows **Each tag must be 24 characters or less**
- [ ] **Edit note** — title, body, tags, pinned persist
- [ ] **Pin / Unpin** from list and form (active notes only)
- [ ] Archived notes: no Pin/Unpin on list; pin switch disabled on edit form
- [ ] Cannot pin an archived note from data layer
- [ ] **Search** matches title, body, or tags (case-insensitive)
- [ ] **Archive** — confirmation; hidden from Active filter and Today Quick Note
- [ ] **Delete permanently** — two-step confirmation; doc removed from Firestore
- [ ] **Quick Note** (Today): latest pinned active note when pins exist
- [ ] **Quick Note**: latest active note when no pinned actives
- [ ] Tag limits: max 10 tags, 24 chars each; title max 160; body max 10000
- [ ] Friendly Firestore errors (no raw `FirebaseError:` text)
- [ ] `npm run typecheck` passes

### Notes data (MVP)

- [ ] Notes load without composite indexes (collection snapshot + client filter/sort)

## Goals

- [ ] Growth tab shows **Habits** and **Goals** with separate loading/error states
- [ ] **Add goal** — title required; category; progress 0–100; optional target date
- [ ] Doc at `users/{uid}/goals/{goalId}` with correct fields and timestamps
- [ ] **Edit goal** — title, description, category, progress, target date persist
- [ ] **Active / Completed / Archived** filters work (client-side)
- [ ] Progress 100 does **not** auto-complete; user must **Mark complete**
- [ ] **Mark complete** from active goal
- [ ] **Mark active** reopens completed goal (not archived)
- [ ] **Archive** with confirmation; `pinned` N/A; archived cannot reopen
- [ ] Archived goal edit: Save allowed; no Mark active; Archive hidden
- [ ] Active goal past target shows **Overdue** label
- [ ] No hard delete for goals
- [ ] Friendly Firestore errors (no raw `FirebaseError:` text)

### Goals data (MVP)

- [ ] Goals load without composite indexes (collection snapshot + client filter/sort)

## Security (Firebase Console)

- [ ] Unauthenticated Firestore read/write denied
- [ ] User A cannot read/write `users/{userB_uid}`
- [ ] User A can read/write own `users/{userA_uid}` document

## Regression

- [ ] No hardcoded user IDs in source
- [ ] `.env` not tracked by git
- [ ] App runs after cold start with persisted session (AsyncStorage auth persistence)
- [ ] Tasks, Money, Notes, and Today dashboard (except Growth) unchanged after Goals MVP
- [ ] Habits still work: mark done, undo, archive, streaks
