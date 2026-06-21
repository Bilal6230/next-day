# Next Day — Manual test checklist

Use this for **Internal Beta v1** sign-off. Configure `.env` locally and deploy `firestore.rules` before testing.

See also [BETA_RELEASE.md](./BETA_RELEASE.md) for install, EAS build, and release steps.

---

## Internal Beta v1 Checklist

Primary sign-off checklist for internal beta. Complete all sections before distributing a preview APK.

### 1. Pre-flight

- [ ] `npm install` succeeds
- [ ] `npm run typecheck` passes
- [ ] `npx expo start -c` starts Metro
- [ ] `.env` exists locally (not committed)
- [ ] App launches without Firebase config error when `.env` is valid
- [ ] App shows **Firebase setup required** when `.env` is missing or incomplete

### 2. Device matrix

| Environment | Required |
|-------------|----------|
| Android physical device | **Yes** — reminders, keyboard, edge-to-edge |
| Android emulator | **Yes** — smoke CRUD + navigation |
| iOS Simulator | If available — layout + navigation |
| iOS physical device | Later — before wider beta / TestFlight |

### 3. Auth

- [ ] Register — validation for empty/invalid email, short password, mismatched passwords
- [ ] Register — successful signup opens main tabs; `users/{uid}` doc created
- [ ] Login — validation for empty fields
- [ ] Login — wrong password shows friendly error (not raw Firebase code)
- [ ] Login — correct credentials open main app
- [ ] Forgot password — invalid email validation; success message on submit
- [ ] Session persists after app restart (cold start lands on main tabs when signed in)
- [ ] Sign out from More → returns to login

### 4. Navigation

- [ ] All 5 tabs reachable: Today, Tasks, Money, Growth, More
- [ ] More → Notes → Back → More home
- [ ] More → Reminders → Back → More home
- [ ] More → Deen → Back → More home
- [ ] More → Deen → Azkar → Back → Deen home
- [ ] Growth → Add habit / Add goal → Back → Growth home
- [ ] Tasks form → Back → task list
- [ ] Money bill/expense forms → Back → Money home
- [ ] Today card deep links open correct tab/screen (tasks, money, growth, notes, focus)

### 5. Core CRUD smoke

- [ ] **Task** — create, edit, complete, archive, delete permanently
- [ ] **Bill** — create, edit, mark paid/unpaid, archive
- [ ] **Expense** — create, edit, delete
- [ ] **Habit** — create, edit, mark done today, undo, archive
- [ ] **Goal** — create, edit, mark complete, mark active, archive
- [ ] **Note** — create, edit, pin/unpin, archive, delete permanently
- [ ] **Today Focus** — set (custom/task/goal), complete, change, clear

### 6. Reminders

- [ ] App launch does **not** request notification permission
- [ ] More → Reminders opens settings
- [ ] Master ON requests permission
- [ ] Denied permission shows friendly message; master stays off
- [ ] Granted permission allows save
- [ ] Settings persist at `users/{uid}/settings/reminders`
- [ ] Set category time 1–2 minutes ahead → local notification fires (physical Android)
- [ ] Disable category cancels that notification
- [ ] Disable master cancels all four category notifications
- [ ] Sign out cancels scheduled reminders

### 7. Stabilization

- [ ] Double-tap list actions (task/bill/habit/note pin) → single state change
- [ ] Double-tap form saves / focus actions → single effect
- [ ] Keyboard does not hide Save buttons on forms
- [ ] Bottom tabs remain visible when keyboard is open
- [ ] Friendly errors only — no raw `FirebaseError`, `auth/`, or `permission-denied` in UI

### 8. Offline

- [ ] Airplane mode on a list screen → friendly error + Retry
- [ ] Reconnect → data loads; Retry works

### 9. Persistence

- [ ] Create data → background app → reopen → data still present
- [ ] Data writes under `users/{uid}/...` in Firestore Console

### 10. Build

- [ ] `npm run typecheck` passes
- [ ] `eas build --profile preview --platform android` succeeds (when distributing APK)

---

## Appendix — Detailed feature checklists

Legacy per-feature checks below. Use for deep regression after the Internal Beta v1 pass above.

## Beta Stabilization v1

Cross-cutting checks after stabilization changes (action locks, keyboard, errors, shared UI).

### Session & auth smoke

- [ ] Cold start with saved session lands on main tabs
- [ ] Sign out from More → login screen; sign in again restores data
- [ ] Wrong password shows friendly message (not `auth/wrong-password` or raw Firebase text)
- [ ] Register validation errors are field-level, not raw Firebase codes

### Tab navigation & back stacks

- [ ] All 5 tabs reachable: Today, Tasks, Money, Growth, More
- [ ] More → Notes → Back → More home
- [ ] Growth → Add habit / Add goal → Back → Growth home
- [ ] Tasks / Money form → Back → list
- [ ] Bottom tabs stay visible when keyboard is open (forms and Focus modal)

### Today card deep links

- [ ] Tasks Due Today → **View all** opens Tasks (Today filter)
- [ ] Tasks Due Today → **Add task** opens Task form
- [ ] Bills Due Soon → **Open Money** / **Add bill** navigate correctly
- [ ] Habit Progress → **Open Growth** / **Add habit** navigate correctly
- [ ] Quick Note → **Open Notes** / **Add note** / tap preview opens correct note form
- [ ] Today's Focus → **Open task** / **Open goal** deep links when linked item exists

### Duplicate rapid actions

- [ ] Task: double-tap complete / archive / delete → single state change
- [ ] Bill: double-tap paid toggle / archive → single change
- [ ] Habit: double-tap done / undo / archive → single change
- [ ] Goal form: double-tap Save / Mark complete / Archive → single change
- [ ] Note list: double-tap pin → single change
- [ ] Note form: double-tap Save / Archive / Delete → single change
- [ ] Today Focus: double-tap complete / clear / replace (modal save) → single change

### Keyboard & safe area

- [ ] iOS: Task, Note, Goal, Habit, Bill, Expense forms — Save button tappable above keyboard
- [ ] Android: same forms — Save tappable; Focus setup modal usable with keyboard open
- [ ] Today screen scroll clears bottom tab bar on smaller screens
- [ ] Android: bottom tab labels readable above system navigation

### Offline & friendly errors

- [ ] Airplane mode on a list screen → friendly error + **Retry** restores on reconnect
- [ ] No UI string contains `FirebaseError`, `permission-denied`, or `auth/` codes
- [ ] Domain errors show meaningful copy (e.g. pin archived note, goal not found) — not only generic fallback

### Data persistence smoke

- [ ] Create an item → background app → reopen → data still present
- [ ] CRUD smoke: one create/edit/archive per module still writes under `users/{uid}/...`

### Build

- [ ] `npm run typecheck` passes

## Reminders MVP

### Setup & permissions

- [ ] App launch does **not** request notification permission
- [ ] More → **Reminders** opens settings screen
- [ ] More → **Notes** still works
- [ ] Toggling master **Enable reminders** ON requests permission (iOS + Android)
- [ ] Denying permission shows friendly message; master stays off
- [ ] Granting permission allows save

### Settings persistence

- [ ] Doc created at `users/{uid}/settings/reminders` on first save
- [ ] Master enable/disable persists after reload
- [ ] Category toggles and times persist
- [ ] Enabling a category without a time uses default (Focus 08:00, Habits 08:30, Tasks 09:00, Bills 19:00)
- [ ] Category enabled without time when master on → validation error on save
- [ ] Invalid HH:mm shows validation error

### Scheduling behavior

- [ ] Today Focus schedules only when focus is missing or incomplete
- [ ] Completing today’s focus suppresses Today Focus notification after sync
- [ ] Habits schedule only when active habits exist and not all are done today
- [ ] Tasks schedule only when pending tasks are due today or overdue
- [ ] Bills schedule only when unpaid bills are due soon or overdue
- [ ] Changing a category time reschedules (no duplicate at old time)
- [ ] Disabling a category cancels that notification
- [ ] Disabling master cancels all four category notifications
- [ ] Sign out cancels scheduled reminders for that user

### Regression

- [ ] Sign out from More still works
- [ ] Friendly Firestore errors (no raw `FirebaseError:` text)
- [ ] `npm run typecheck` passes

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
- [ ] **Today's Focus** live card: loading, empty, set, complete, change, clear
- [ ] Scroll works on smaller screens

## Today Focus

- [ ] Static Today's Focus card replaced with live **TodayFocusCard**
- [ ] Empty state shows **Set focus** → modal source picker
- [ ] **Custom focus** — title required; optional note; doc at `users/{uid}/dailyFocus/{dateKey}`
- [ ] **Task focus** — pending tasks only; stores `sourceId` + title snapshot; `note` null
- [ ] **Goal focus** — active goals only; stores `sourceId` + title snapshot; `note` null
- [ ] **Complete** sets `completed: true` and `completedAt`
- [ ] **Undo complete** clears `completed` and `completedAt`
- [ ] **Change focus** replaces same-day doc; `completed` resets to false
- [ ] Replacement preserves original `createdAt`; `updatedAt` updates
- [ ] **Clear** (with confirmation) deletes today's focus doc
- [ ] New local date uses new `dateKey` document
- [ ] Open task/goal link only when linked item still exists
- [ ] Completing focus does not complete linked task/goal
- [ ] Friendly Firestore errors (no raw `FirebaseError:` text)

### Today Focus data (MVP)

- [ ] Single-doc subscription per day; no composite indexes

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
- [ ] Saving a goal cannot change status directly; use Mark complete / Mark active / Archive only
- [ ] Friendly Firestore errors (no raw `FirebaseError:` text)

### Goals data (MVP)

- [ ] Goals load without composite indexes (collection snapshot + client filter/sort)

## Deen / Dhikr MVP

- [ ] More → Deen opens dhikr dashboard
- [ ] More → Notes still works
- [ ] More → Reminders still works
- [ ] Sign out still works
- [ ] Six predefined dhikrs visible under Common Dhikrs
- [ ] Add custom dhikr
- [ ] Edit custom dhikr
- [ ] Archive custom dhikr (with confirmation)
- [ ] Archived custom dhikr disappears from active list
- [ ] Tap predefined dhikr opens counter
- [ ] Tap custom dhikr opens counter
- [ ] +1 increments count instantly
- [ ] Undo decrements and count does not go below 0
- [ ] Target reached shows completed badge
- [ ] Reset today clears count and completed state (with confirmation)
- [ ] Custom doc at `users/{uid}/dhikrs/{dhikrId}`
- [ ] Progress doc at `users/{uid}/dhikrProgress/{dateKey}/items/{dhikrId}`
- [ ] App restart preserves today’s counts
- [ ] New local date starts fresh progress
- [ ] Friendly errors only (no raw `FirebaseError:` text)
- [ ] `npm run typecheck` passes

### Deen data (MVP)

- [ ] Predefined dhikrs are local constants only (not written to Firestore)
- [ ] Dhikrs and progress load without composite indexes

## Morning / Evening Azkar MVP

- [ ] More → Deen opens
- [ ] Deen shows Morning & Evening Azkar card with live Morning X/Y · Evening X/Y
- [ ] Deen → Open Azkar opens azkar checklist
- [ ] Morning starter azkar visible (5 items)
- [ ] Evening starter azkar visible (5 items)
- [ ] Mark morning item done
- [ ] Undo morning item
- [ ] Mark evening item done
- [ ] Summary shows Morning X/Y and Evening X/Y
- [ ] Add custom morning azkar
- [ ] Add custom evening azkar
- [ ] Edit custom azkar
- [ ] Archive custom azkar (confirmation)
- [ ] Archived item disappears from active list
- [ ] Progress stored at `users/{uid}/azkarProgress/{dateKey}/items/{azkarItemId}`
- [ ] Custom item stored at `users/{uid}/azkarItems/{azkarItemId}`
- [ ] App restart preserves today’s azkar progress
- [ ] New local date starts fresh progress
- [ ] Existing Dhikr feature still works end-to-end
- [ ] More → Notes still works
- [ ] More → Reminders still works
- [ ] Sign out still works
- [ ] Friendly errors only (no raw `FirebaseError:` text)
- [ ] `npm run typecheck` passes

### Azkar data (MVP)

- [ ] Predefined starter azkar are local constants only (not written to Firestore)
- [ ] Azkar items and progress load without composite indexes

## Security (Firebase Console)

- [ ] Unauthenticated Firestore read/write denied
- [ ] User A cannot read/write `users/{userB_uid}`
- [ ] User A can read/write own `users/{userA_uid}` document

## Regression

- [ ] No hardcoded user IDs in source
- [ ] `.env` not tracked by git
- [ ] App runs after cold start with persisted session (AsyncStorage auth persistence)
- [ ] Tasks, Money, Notes, and other Today cards unchanged after Today Focus MVP
- [ ] Habits still work: mark done, undo, archive, streaks
