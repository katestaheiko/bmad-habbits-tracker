# Tasks: Habit Tracker CLI

**Feature**: `001-habit-tracker` | **Generated**: 2026-04-30  
**Input**: [spec.md](spec.md), [plan.md](plan.md)  
**Source**: `src/src/` (TypeScript), `src/tests/` (Vitest)

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 35 |
| Done | 27 |
| Todo | 8 |
| Epics | 6 |
| User stories covered | 5 (US1–US5) |

### Quick Task Index

| Status | Tasks |
|--------|-------|
| ✅ DONE | T-001–T-023, T-029–T-032 |
| 🔲 TODO | T-024–T-028, T-033–T-035 |

---

## Epic 1: Setup

**Purpose**: Project scaffolding — TypeScript, build tooling, dependency wiring.

### T-001 — Initialize TypeScript CLI project ✅ DONE

**Status**: DONE  
**User Stories**: All  
**Dependencies**: None

**Description**: Create `src/package.json` with the `habit` binary entry, NPM scripts (`build`, `typecheck`, `test`, `test:watch`, `dev`), and production/dev dependencies (`commander`, `chalk`, `better-sqlite3`, `typescript`, `vitest`). Set `"type": "module"` for ESM output.

**Acceptance Criteria**:
- `package.json` present at `src/package.json` with `"bin": { "habit": "dist/index.js" }`
- `better-sqlite3 ^9`, `chalk ^5`, `commander ^12` in dependencies
- `vitest ^1.6`, `typescript ^5.4` in devDependencies

**Evidence**: `src/package.json` exists and matches all criteria.

---

### T-002 — Configure TypeScript with strict mode ✅ DONE

**Status**: DONE  
**User Stories**: All  
**Dependencies**: T-001

**Description**: Create `src/tsconfig.json` with `"strict": true`, `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, targeting Node.js 22.

**Acceptance Criteria**:
- `tsconfig.json` present at `src/tsconfig.json`
- `"strict": true` confirmed
- `npm run typecheck` (`tsc --noEmit`) exits 0

**Evidence**: `src/tsconfig.json` exists; plan.md constitution gate confirms `"strict": true` PASS.

---

## Epic 2: Core Data Layer

**Purpose**: SQLite persistence, typed errors, and habit CRUD operations.

### T-003 — Implement database connection and schema init ✅ DONE

**Status**: DONE  
**User Stories**: US1, US2, US3, US4, US5  
**Dependencies**: T-001, T-002

**Description**: Implement `src/src/db.ts`. Open `~/.habit-tracker.db` via `better-sqlite3`, enable `PRAGMA foreign_keys = ON` and `PRAGMA journal_mode = WAL`, then run `CREATE TABLE IF NOT EXISTS` for `habits` (id, name UNIQUE, created_at) and `tracking` (id, habit_id FK cascade, date, UNIQUE(habit_id, date)).

**Acceptance Criteria**:
- Database file created automatically on first import — no manual setup
- `habits` table has `UNIQUE(name)` constraint
- `tracking` table has `UNIQUE(habit_id, date)` and `ON DELETE CASCADE`
- `PRAGMA foreign_keys` returns 1 after connection open

**Evidence**: `src/src/db.ts` exists with correct schema; constitution gate confirms auto-creation and cascade PASS.

---

### T-004 — Implement typed error class ✅ DONE

**Status**: DONE  
**User Stories**: US1, US2, US3, US4, US5  
**Dependencies**: T-001, T-002

**Description**: Implement `src/src/errors.ts` — export `ErrorCode` union type (`'DUPLICATE' | 'NOT_FOUND' | 'INVALID_NAME' | 'DB_ERROR'`) and `AppError extends Error` with a `readonly code: ErrorCode` field.

**Acceptance Criteria**:
- `AppError` extends `Error`
- `code` property is typed as `ErrorCode`
- No use of `any`

**Evidence**: `src/src/errors.ts` exists and matches spec exactly.

---

### T-005 — Implement `addHabit()` ✅ DONE

**Status**: DONE  
**User Stories**: US1  
**Dependencies**: T-003, T-004

**Description**: In `src/src/habits.ts`, implement `validateName` (rejects empty/whitespace and names > 100 chars with `AppError('INVALID_NAME')`) and `addHabit(name)` using `INSERT … RETURNING`. Catch UNIQUE constraint violations and re-throw as `AppError('DUPLICATE')`. Wrap all other SQLite errors as `AppError('DB_ERROR')`.

**Acceptance Criteria**:
- `addHabit('exercise')` returns `Habit` object with id, name, created_at
- `addHabit('exercise')` called twice throws `AppError('DUPLICATE')`
- `addHabit('')` throws `AppError('INVALID_NAME')`
- `addHabit('   ')` (whitespace only) throws `AppError('INVALID_NAME')`
- No raw SQLite error messages escape

**Evidence**: `src/src/habits.ts` — `addHabit` and `validateName` implemented correctly.

---

### T-006 — Implement `listHabits()` and `findHabit()` ✅ DONE

**Status**: DONE  
**User Stories**: US2, US3, US4  
**Dependencies**: T-003, T-004

**Description**: In `src/src/habits.ts`, implement `listHabits()` (SELECT ordered by `created_at ASC, id ASC`, returns `Habit[]`) and `findHabit(name)` (SELECT WHERE name = ?, returns `Habit | undefined`).

**Acceptance Criteria**:
- `listHabits()` returns an empty array when no habits exist
- `listHabits()` returns habits in creation order
- `findHabit('missing')` returns `undefined` without throwing

**Evidence**: `src/src/habits.ts` — both functions implemented.

---

### T-007 — Implement `deleteHabit()` ✅ DONE

**Status**: DONE  
**User Stories**: US5  
**Dependencies**: T-003, T-004, T-006

**Description**: In `src/src/habits.ts`, implement `deleteHabit(name)` — calls `findHabit` and throws `AppError('NOT_FOUND')` if absent; otherwise deletes by id (cascade removes all tracking rows).

**Acceptance Criteria**:
- `deleteHabit('exercise')` after adding exercise removes the habit
- All tracking rows for the habit are removed automatically (ON DELETE CASCADE)
- `deleteHabit('nonexistent')` throws `AppError('NOT_FOUND')`

**Evidence**: `src/src/habits.ts` — `deleteHabit` implemented with cascade.

---

## Epic 3: Tracking

**Purpose**: Recording daily completions with idempotency guarantees.

### T-008 — Implement `markDone()` ✅ DONE

**Status**: DONE  
**User Stories**: US2  
**Dependencies**: T-003, T-004

**Description**: In `src/src/tracking.ts`, implement `markDone(habitId, date)` using `INSERT OR IGNORE INTO tracking`. Return `'created'` when `result.changes > 0`, else `'already_done'`.

**Acceptance Criteria**:
- First call for a given (habitId, date) pair returns `'created'` and inserts one row
- Second call for the same pair returns `'already_done'` with zero new rows inserted
- Exit code from the CLI is 0 for both calls (idempotent, FR-004)

**Evidence**: `src/src/tracking.ts` — `markDone` with `INSERT OR IGNORE` implemented.

---

### T-009 — Implement `getCompletionDates()` ✅ DONE

**Status**: DONE  
**User Stories**: US3, US4  
**Dependencies**: T-003

**Description**: In `src/src/tracking.ts`, implement `getCompletionDates(habitId)` — SELECT date FROM tracking WHERE habit_id = ?, ORDER BY date ASC. Returns `string[]` of ISO 8601 date strings.

**Acceptance Criteria**:
- Returns dates sorted ascending
- Returns empty array when no completions exist
- Date strings are in `YYYY-MM-DD` format

**Evidence**: `src/src/tracking.ts` — `getCompletionDates` implemented.

---

### T-010 — Implement `getDoneSetForDate()` ✅ DONE

**Status**: DONE  
**User Stories**: US3  
**Dependencies**: T-003

**Description**: In `src/src/tracking.ts`, implement `getDoneSetForDate(date)` — SELECT habit_id FROM tracking WHERE date = ?. Returns `Set<number>` for O(1) lookup in the list command.

**Acceptance Criteria**:
- Returns a `Set` of habit IDs completed on the given date
- Returns an empty Set when no habits are done that day

**Evidence**: `src/src/tracking.ts` — `getDoneSetForDate` implemented.

---

## Epic 4: Statistics

**Purpose**: Pure functions for streak calculation and completion-rate statistics.

### T-011 — Implement `currentStreak()` ✅ DONE

**Status**: DONE  
**User Stories**: US3, US4  
**Dependencies**: None (pure function)

**Description**: In `src/src/stats.ts`, implement `currentStreak(dates, today)`. Anchor at today if present; fall back to yesterday if present; else return 0. Walk backward counting consecutive days using `prevDay()` helper.

**Acceptance Criteria**:
- `currentStreak([], today)` → 0
- `currentStreak([today], today)` → 1
- `currentStreak([yesterday], today)` → 1 (streak preserved if today not yet done)
- `currentStreak([twoDaysAgo], today)` → 0 (gap breaks streak)
- `currentStreak([d-2, d-1, today], today)` → 3

**Evidence**: `src/src/stats.ts` — `currentStreak` implemented with `prevDay` helper.

---

### T-012 — Implement `longestStreak()` ✅ DONE

**Status**: DONE  
**User Stories**: US4  
**Dependencies**: None (pure function)

**Description**: In `src/src/stats.ts`, implement `longestStreak(dates)` — single pass over sorted dates, counting runs of consecutive calendar days. Returns the maximum run length.

**Acceptance Criteria**:
- `longestStreak([])` → 0
- `longestStreak([today])` → 1
- `longestStreak([d-4, d-3, d-2, d-1, today])` → 5
- Longest streak is preserved even after the streak breaks
- `longestStreak([d-10, d-7, d-6, d-5, d-2, d-1])` → 3

**Evidence**: `src/src/stats.ts` — `longestStreak` implemented.

---

### T-013 — Implement `weeklyRate()` ✅ DONE

**Status**: DONE  
**User Stories**: US4  
**Dependencies**: None (pure function)

**Description**: In `src/src/stats.ts`, implement `weeklyRate(dates, today)` — count completions in the 7-day window `[today-6 … today]`; return `Math.round(count / 7 * 100)`.

**Acceptance Criteria**:
- `weeklyRate([], today)` → 0
- 7 completions in 7 days → 100
- 0 completions in the window → 0
- 1 completion → 14
- 4 completions → 57
- Dates older than 7 days are excluded

**Evidence**: `src/src/stats.ts` — `weeklyRate` implemented.

---

### T-014 — Implement `computeStats()` ✅ DONE

**Status**: DONE  
**User Stories**: US3, US4  
**Dependencies**: T-011, T-012, T-013

**Description**: In `src/src/stats.ts`, implement `computeStats(dates, today)` — composes `currentStreak`, `longestStreak`, and `weeklyRate` into a single `HabitStats` return value.

**Acceptance Criteria**:
- Returns `{ currentStreak, longestStreak, weeklyRate }` with correct values
- Used by both `list` and `stats` CLI commands

**Evidence**: `src/src/stats.ts` — `computeStats` implemented.

---

## Epic 5: CLI Layer

**Purpose**: `commander`-based CLI with formatted output and error handling.

### T-015 — Implement `ok()` and `err()` output helpers ✅ DONE

**Status**: DONE  
**User Stories**: US1, US2, US3, US4, US5  
**Dependencies**: T-001

**Description**: In `src/src/display.ts`, implement `ok(msg)` (stdout: `✓` in green + space + msg) and `err(msg)` (stderr: `✗` in red + space + msg) using `chalk`.

**Acceptance Criteria**:
- `ok` writes to stdout with chalk green `✓` prefix
- `err` writes to stderr with chalk red `✗` prefix
- FR-008 and FR-009 message conventions satisfied

**Evidence**: `src/src/display.ts` — `ok()` and `err()` implemented.

---

### T-016 — Implement `printHabitList()` ✅ DONE

**Status**: DONE  
**User Stories**: US3  
**Dependencies**: T-015

**Description**: In `src/src/display.ts`, implement `printHabitList(habits, doneSet, streakMap)` — renders a table with dynamic column widths (Name, Today status icon, Streak). Prints `No habits yet…` message when habits is empty.

**Acceptance Criteria**:
- Empty habits array → prints no-habits message, exits 0 (FR-005 edge case)
- Column widths adapt to the longest habit name
- Done habits show `✓` in green; incomplete show `–` in dim
- Streak > 0 shown in yellow with `d` suffix (e.g., `3d`)

**Evidence**: `src/src/display.ts` — `printHabitList` implemented.

---

### T-017 — Implement `printStats()` ✅ DONE

**Status**: DONE  
**User Stories**: US4  
**Dependencies**: T-015

**Description**: In `src/src/display.ts`, implement `printStats(habits, statsMap)` — renders a stats table with columns: Name, Streak, Longest, 7-Day. Prints `No habits yet.` when empty.

**Acceptance Criteria**:
- Renders current streak, longest streak, and weekly rate columns
- Empty habits → prints no-habits message
- Streak values use yellow, longest uses cyan, rate uses green

**Evidence**: `src/src/display.ts` — `printStats` implemented.

---

### T-018 — Wire `habit add` command ✅ DONE

**Status**: DONE  
**User Stories**: US1  
**Dependencies**: T-005, T-015, T-023

**Description**: In `src/src/index.ts`, wire `habit add <name>` → `addHabit(name)` → `ok(…)`. Route errors through `handleError()`.

**Acceptance Criteria**:
- `habit add exercise` on fresh DB prints success and persists habit
- `habit add exercise` twice exits 1 with `✗` error (no duplicate)
- `habit add ""` exits 1 with `✗` error

**Evidence**: `src/src/index.ts` — `add` command wired. ⚠️ Message text needs alignment (see T-024).

---

### T-019 — Wire `habit list` command ✅ DONE

**Status**: DONE  
**User Stories**: US3  
**Dependencies**: T-006, T-010, T-014, T-016, T-023

**Description**: In `src/src/index.ts`, wire `habit list` → `listHabits()` + `getDoneSetForDate(today)` + per-habit `computeStats()` → `printHabitList()`.

**Acceptance Criteria**:
- No habits → prints no-habits message, exits 0
- All habits shown with today's done status and current streak
- Table uses consistent column widths

**Evidence**: `src/src/index.ts` — `list` command wired.

---

### T-020 — Wire `habit done` command ✅ DONE

**Status**: DONE  
**User Stories**: US2  
**Dependencies**: T-006, T-008, T-015, T-023

**Description**: In `src/src/index.ts`, wire `habit done <name>` → `findHabit(name)` (exit 1 if absent) → `markDone(habit.id, today())` → `ok(…)`.

**Acceptance Criteria**:
- `habit done exercise` on existing habit marks completion and exits 0
- `habit done exercise` called again same day exits 0 (idempotent, FR-004)
- `habit done missing` exits 1 with `✗` error
- FR-003 / FR-004 acceptance scenarios pass

**Evidence**: `src/src/index.ts` — `done` command wired. ⚠️ Messages need alignment (see T-025, T-026).

---

### T-021 — Wire `habit stats` command ✅ DONE

**Status**: DONE  
**User Stories**: US4  
**Dependencies**: T-006, T-009, T-014, T-017, T-023

**Description**: In `src/src/index.ts`, wire `habit stats` → `listHabits()` + per-habit `getCompletionDates()` + `computeStats()` → `printStats()`.

**Acceptance Criteria**:
- Shows current streak, longest streak, and 7-day rate for all habits
- No habits → prints no-habits message, exits 0

**Evidence**: `src/src/index.ts` — `stats` command wired. ⚠️ Spec requires `habit stats <name>` per-habit filter (see T-028).

---

### T-022 — Wire `habit delete` command ✅ DONE

**Status**: DONE  
**User Stories**: US5  
**Dependencies**: T-007, T-015, T-023

**Description**: In `src/src/index.ts`, wire `habit delete <name>` → `deleteHabit(name)` → `ok(…)`. Route errors through `handleError()`.

**Acceptance Criteria**:
- `habit delete exercise` removes habit and all history, exits 0
- Deleted habit no longer appears in `habit list`
- `habit delete nonexistent` exits 1 with `✗` error

**Evidence**: `src/src/index.ts` — `delete` command wired. ⚠️ Message text needs alignment (see T-027).

---

### T-023 — Implement `handleError()` ✅ DONE

**Status**: DONE  
**User Stories**: US1, US2, US3, US4, US5  
**Dependencies**: T-004, T-015

**Description**: In `src/src/index.ts`, implement `handleError(e: unknown): never` — routes `AppError` with `code !== 'DB_ERROR'` to `err(message) + process.exit(1)`, `DB_ERROR` to `exit(2)`, and unknown errors to `exit(2)`.

**Acceptance Criteria**:
- User errors (DUPLICATE, NOT_FOUND, INVALID_NAME) → exit code 1
- Internal errors (DB_ERROR) → exit code 2
- Unknown errors → exit code 2
- No raw SQLite messages ever exposed (FR-010)

**Evidence**: `src/src/index.ts` — `handleError` implemented and used by all commands.

---

### T-024 — Fix `habit add` success message to match spec 🔲 TODO

**Status**: TODO  
**User Stories**: US1  
**Dependencies**: T-018  
**Priority**: P2 (from plan.md Open Items #2)

**Description**: In `src/src/index.ts`, change the `add` command's success message from `Added habit: "${name}"` to `Habit "${name}" added` (FR-001 literal).

**File**: `src/src/index.ts` — `add` action handler, `ok(...)` call.

**Acceptance Criteria**:
- `habit add exercise` prints exactly `✓ Habit "exercise" added`
- FR-001 acceptance scenario 1 passes

---

### T-025 — Fix `habit done` first-time success message to match spec 🔲 TODO

**Status**: TODO  
**User Stories**: US2  
**Dependencies**: T-020  
**Priority**: P2 (from plan.md Open Items #1)

**Description**: In `src/src/index.ts`, change the `done` command's success message from `Marked "${name}" as done today` to `"${name}" marked as done for today` (FR-003 / US2 acceptance scenario 1 literal).

**File**: `src/src/index.ts` — `done` action handler, `ok(...)` call after `markDone`.

**Acceptance Criteria**:
- `habit done exercise` (first time) prints exactly `✓ "exercise" marked as done for today`
- US2 acceptance scenario 1 passes

---

### T-026 — Add distinct already-done message for idempotent `habit done` 🔲 TODO

**Status**: TODO  
**User Stories**: US2  
**Dependencies**: T-020, T-025  
**Priority**: P2 (from plan.md Open Items #3)

**Description**: In `src/src/index.ts`, inspect the `MarkResult` returned by `markDone()`. When result is `'already_done'`, print `"${name}" already done today` instead of the first-time message. Both paths still exit 0.

**File**: `src/src/index.ts` — `done` action handler, add branch on `markDone` return value.

**Acceptance Criteria**:
- `habit done exercise` first run → `✓ "exercise" marked as done for today`, exits 0
- `habit done exercise` second run → `✓ "exercise" already done today`, exits 0
- No duplicate tracking row created (idempotency preserved)
- US2 acceptance scenario 2 passes

---

### T-027 — Fix `habit delete` success message to match spec 🔲 TODO

**Status**: TODO  
**User Stories**: US5  
**Dependencies**: T-022  
**Priority**: P3 (from plan.md Open Items #6)

**Description**: In `src/src/index.ts`, change the `delete` command's success message from `Deleted habit: "${name}"` to `Habit "${name}" deleted` (FR-007 / US5 acceptance scenario 1 literal).

**File**: `src/src/index.ts` — `delete` action handler, `ok(...)` call.

**Acceptance Criteria**:
- `habit delete exercise` prints exactly `✓ Habit "exercise" deleted`
- US5 acceptance scenario 1 passes

---

### T-028 — Add optional `<name>` argument to `habit stats` 🔲 TODO

**Status**: TODO  
**User Stories**: US4  
**Dependencies**: T-021  
**Priority**: P3 (from plan.md Open Items #4)

**Description**: In `src/src/index.ts`, update the `stats` command from `stats` to `stats [name]`. When `name` is provided, filter `habits` to the single matching habit; if not found, exit 1 with `✗` error. When no `name` is given, show all habits (existing behaviour).

**File**: `src/src/index.ts` — `stats` command definition and action handler.

**Acceptance Criteria**:
- `habit stats exercise` shows stats for only "exercise"
- `habit stats` (no arg) still shows all habits
- `habit stats missing` exits 1 with `✗ No habit named "missing" found.`
- US4 acceptance scenario 1, 2, 3 all pass

---

## Epic 6: Testing

**Purpose**: Unit tests verifying pure functions and repository-layer contracts.

### T-029 — `currentStreak` unit tests ✅ DONE

**Status**: DONE  
**User Stories**: US3, US4  
**Dependencies**: T-011  
**File**: `src/tests/stats.test.ts`

**Description**: Implement unit tests for `currentStreak` — empty input, today-only, yesterday-only (FR-012 boundary), gap breaks streak, single long run.

**Acceptance Criteria**:
- 8 test cases covering all acceptance scenarios from plan.md Phase 2.4
- `currentStreak([yesterday], today)` → 1 (date-boundary test present ✓)
- All tests pass (`npm test`)

**Evidence**: `src/tests/stats.test.ts` — `currentStreak` describe block with 8 cases.

---

### T-030 — `longestStreak` unit tests ✅ DONE

**Status**: DONE  
**User Stories**: US4  
**Dependencies**: T-012  
**File**: `src/tests/stats.test.ts`

**Description**: Implement unit tests for `longestStreak` — empty, single date, unbroken run, multiple runs (picks longest), equally long runs.

**Acceptance Criteria**:
- 5 test cases covering plan.md Phase 2.4 acceptance scenarios
- All tests pass

**Evidence**: `src/tests/stats.test.ts` — `longestStreak` describe block with 5 cases.

---

### T-031 — `weeklyRate` unit tests ✅ DONE

**Status**: DONE  
**User Stories**: US4  
**Dependencies**: T-013  
**File**: `src/tests/stats.test.ts`

**Description**: Implement unit tests for `weeklyRate` — empty, 7/7 → 100, 0 in window → 0, 1/7 → 14, 4/7 → 57, completions older than 7 days excluded.

**Acceptance Criteria**:
- 6 test cases
- Ignores-older-than-7-days test present
- All tests pass

**Evidence**: `src/tests/stats.test.ts` — `weeklyRate` describe block with 6 cases.

---

### T-032 — Streak invariant tests (idempotency, boundary) ✅ DONE

**Status**: DONE  
**User Stories**: US2, US3  
**Dependencies**: T-011  
**File**: `src/tests/habits.test.ts`

**Description**: Tests in `habits.test.ts` verify domain invariants using pure `currentStreak`: fresh habit → 0, done today → 1, consecutive extension, gap reset to 0, idempotent done (Set dedup), yesterday-streak preserved.

**Acceptance Criteria**:
- 6 invariant test cases
- Idempotency invariant: `[...new Set([today, today])]` produces streak of 1
- Yesterday-preserved invariant present (FR-012 compliance)
- All tests pass

**Evidence**: `src/tests/habits.test.ts` — `streak invariants` describe block with 6 cases.

---

### T-033 — Add `addHabit` repository unit tests 🔲 TODO

**Status**: TODO  
**User Stories**: US1  
**Dependencies**: T-005  
**Priority**: P2 (plan.md Testing Plan — `habits.test.ts` required scenarios missing)  
**File**: `src/tests/habits.test.ts`

**Description**: Add a test suite using an in-memory or temp-file SQLite database to test `addHabit` — duplicate name → `AppError('DUPLICATE')`, empty string → `AppError('INVALID_NAME')`, whitespace-only → `AppError('INVALID_NAME')`. Requires a test setup that overrides the DB path (e.g., environment variable or dependency injection for the DB module) or uses `better-sqlite3` in-memory mode.

**Acceptance Criteria**:
- `addHabit('exercise')` twice throws `AppError` with code `'DUPLICATE'`
- `addHabit('')` throws `AppError` with code `'INVALID_NAME'`
- `addHabit('   ')` throws `AppError` with code `'INVALID_NAME'`
- Tests are isolated (each test uses a fresh DB or cleanup hook)
- `npm test` passes

---

### T-034 — Add `deleteHabit` NOT_FOUND unit test 🔲 TODO

**Status**: TODO  
**User Stories**: US5  
**Dependencies**: T-007, T-033  
**Priority**: P2 (plan.md Testing Plan — `habits.test.ts` required scenarios missing)  
**File**: `src/tests/habits.test.ts`

**Description**: Add a test case for `deleteHabit('nonexistent')` → throws `AppError('NOT_FOUND')`. Reuse the isolated DB setup from T-033.

**Acceptance Criteria**:
- `deleteHabit('nonexistent')` throws `AppError` with code `'NOT_FOUND'`
- Test is isolated (does not affect other tests)
- `npm test` passes

---

### T-035 — Add `markDone` idempotency unit test 🔲 TODO

**Status**: TODO  
**User Stories**: US2  
**Dependencies**: T-008, T-033  
**Priority**: P2 (plan.md constitution check — idempotency PARTIAL)  
**File**: `src/tests/habits.test.ts` (or new `src/tests/tracking.test.ts`)

**Description**: Add a test that calls `markDone(habitId, date)` twice with the same arguments. Assert first call returns `'created'` and second returns `'already_done'`. Assert only one row exists in the tracking table. Reuse the isolated DB setup from T-033.

**Acceptance Criteria**:
- First `markDone(id, date)` returns `'created'`
- Second `markDone(id, date)` returns `'already_done'`
- Exactly one tracking row exists after both calls
- `npm test` passes

---

## Dependency Graph

```
T-001 → T-002 → T-003 → T-005 → T-018 ─┐
                       ↘ T-006 → T-019 ─┤
                         T-006 → T-020 ─┤
                         T-007 → T-022 ─┤
                                        ├→ (CLI working)
T-001 → T-002 → T-004 ─────────────────┤
                                        │
T-003 → T-008 → T-020 ─────────────────┤
T-003 → T-009 → T-021 ─────────────────┤
T-003 → T-010 → T-019 ─────────────────┘

T-011 → T-014 → T-019, T-021
T-012 → T-014
T-013 → T-014

T-015 → T-016 → T-019
T-015 → T-017 → T-021
T-015 → T-023

T-018 → T-024
T-020 → T-025 → T-026
T-022 → T-027
T-021 → T-028

T-033 → T-034
T-033 → T-035
```

---

## Traceability Matrix

| Task | US1 Add Habit | US2 Mark Done | US3 List Habits | US4 Statistics | US5 Delete Habit |
|------|:---:|:---:|:---:|:---:|:---:|
| T-001 Setup project | ✓ | ✓ | ✓ | ✓ | ✓ |
| T-002 TypeScript config | ✓ | ✓ | ✓ | ✓ | ✓ |
| T-003 db.ts schema | ✓ | ✓ | ✓ | ✓ | ✓ |
| T-004 errors.ts | ✓ | ✓ | ✓ | ✓ | ✓ |
| T-005 addHabit() | ✓ | | | | |
| T-006 listHabits / findHabit | | ✓ | ✓ | ✓ | |
| T-007 deleteHabit() | | | | | ✓ |
| T-008 markDone() | | ✓ | | | |
| T-009 getCompletionDates() | | | ✓ | ✓ | |
| T-010 getDoneSetForDate() | | | ✓ | | |
| T-011 currentStreak() | | | ✓ | ✓ | |
| T-012 longestStreak() | | | | ✓ | |
| T-013 weeklyRate() | | | | ✓ | |
| T-014 computeStats() | | | ✓ | ✓ | |
| T-015 ok() / err() | ✓ | ✓ | ✓ | ✓ | ✓ |
| T-016 printHabitList() | | | ✓ | | |
| T-017 printStats() | | | | ✓ | |
| T-018 habit add command | ✓ | | | | |
| T-019 habit list command | | | ✓ | | |
| T-020 habit done command | | ✓ | | | |
| T-021 habit stats command | | | | ✓ | |
| T-022 habit delete command | | | | | ✓ |
| T-023 handleError() | ✓ | ✓ | ✓ | ✓ | ✓ |
| T-024 Fix add message | ✓ | | | | |
| T-025 Fix done message | | ✓ | | | |
| T-026 Already-done message | | ✓ | | | |
| T-027 Fix delete message | | | | | ✓ |
| T-028 stats \<name\> arg | | | | ✓ | |
| T-029 currentStreak tests | | | ✓ | ✓ | |
| T-030 longestStreak tests | | | | ✓ | |
| T-031 weeklyRate tests | | | | ✓ | |
| T-032 Streak invariant tests | | ✓ | ✓ | | |
| T-033 addHabit unit tests | ✓ | | | | |
| T-034 deleteHabit unit tests | | | | | ✓ |
| T-035 markDone idempotency test | | ✓ | | | |

### Coverage Summary

| User Story | Priority | Tasks | Status |
|-----------|----------|-------|--------|
| US1 — Add a Named Habit | P1 | T-001–T-005, T-015, T-018, T-023–T-024, T-033 | 1 todo (T-024 message fix, T-033 tests) |
| US2 — Mark a Habit as Done | P2 | T-006, T-008, T-020, T-023, T-025–T-026, T-032, T-035 | 3 todo (message fixes + test) |
| US3 — List All Habits | P3 | T-006, T-009–T-011, T-014, T-016, T-019, T-023, T-029, T-032 | 0 todo |
| US4 — View Statistics | P4 | T-009, T-011–T-014, T-017, T-021, T-023, T-028–T-031 | 1 todo (T-028 \<name\> arg) |
| US5 — Delete a Habit | P5 | T-007, T-015, T-022–T-023, T-027, T-034 | 2 todo (message fix + test) |

---

## Spec Compliance Gaps (Open Items)

Directly from `plan.md` § Open Items:

| # | Item | Task | Priority |
|---|------|------|----------|
| 1 | `habit done` message: `Marked "x" as done today` → `"x" marked as done for today` | T-025 | P2 |
| 2 | `habit add` message: `Added habit: "x"` → `Habit "x" added` | T-024 | P2 |
| 3 | `habit done` already-done case has no distinct message | T-026 | P2 |
| 4 | `habit stats` takes no `<name>` argument — spec requires per-habit filter | T-028 | P3 |
| 5 | Date-boundary test (yesterday-only → streak 1) | ✅ Present in `stats.test.ts` | — |
| 6 | `habit delete` message: `Deleted habit: "x"` → `Habit "x" deleted` | T-027 | P3 |

---

## Suggested Execution Order for Remaining TODO Tasks

```
P2 (message fixes — small, independent):
  T-024 (add message) — 1-line change in index.ts
  T-025 (done message) — 1-line change in index.ts
  T-026 (already-done branch) — ~5-line change in index.ts
  T-027 (delete message) — 1-line change in index.ts

P3 (feature addition):
  T-028 (stats <name> arg) — ~15-line change in index.ts

Testing (requires DB isolation setup):
  T-033 (addHabit tests) — depends on isolation strategy
  T-034 (deleteHabit test) — depends on T-033 setup
  T-035 (markDone idempotency test) — depends on T-033 setup
```

**Parallel opportunities**: T-024, T-025, T-027 can be applied in a single multi-replace (all touch independent lines in `index.ts`). T-033, T-034, T-035 can be written in a single pass once the DB isolation pattern is decided.
