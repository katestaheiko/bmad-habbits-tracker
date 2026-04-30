# Implementation Plan: Habit Tracker CLI

**Branch**: `001-habit-tracker` | **Date**: 2026-04-30 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-habit-tracker/spec.md`

## Summary

Build a local CLI habit tracker that lets users add named habits, mark daily completions, list habits with streaks, view per-habit statistics, and delete habits. The implementation uses TypeScript 5 with strict mode, SQLite via `better-sqlite3` (synchronous), and `commander` + `chalk` for the CLI layer. All business logic (streak calculation, statistics) lives in pure functions. The full implementation already exists in `src/src/`; this plan documents the architecture, validates it against the spec and constitution, and defines the phased delivery sequence.

## Technical Context

**Language/Version**: TypeScript 5.4, strict mode (`"strict": true`)  
**Primary Dependencies**: `commander` ^12, `chalk` ^5, `better-sqlite3` ^9  
**Storage**: SQLite at `~/.habit-tracker.db`, auto-created on first use  
**Testing**: Vitest ^1.6, co-located under `src/tests/`  
**Target Platform**: macOS / Linux developer workstation, Node.js 22 LTS  
**Project Type**: CLI tool (single binary `habit`)  
**Performance Goals**: All commands < 200 ms on a modern developer laptop  
**Constraints**: No async/await in DB call paths; no network calls at runtime; no raw SQLite errors exposed to users  
**Scale/Scope**: Up to 50 habits, up to 365 completions per habit per year (v1 only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Requirement | Status |
|------|-------------|--------|
| TypeScript strict | `"strict": true` in tsconfig | PASS — confirmed in `src/tsconfig.json` |
| No async DB calls | All `better-sqlite3` calls are synchronous | PASS — `db.prepare().get/all/run()` only |
| Pure business logic | Streak and stats in functions with no DB imports | PASS — `stats.ts` is pure; no DB import |
| Error taxonomy | `DUPLICATE`, `NOT_FOUND`, `INVALID_NAME`, `DB_ERROR` → exit codes 1/1/1/2 | PASS — `errors.ts` + `handleError()` |
| Exit codes | 0 = success, 1 = user error, 2 = internal | PASS — `handleError` branches on `DB_ERROR` |
| No raw SQLite errors | All SQLite exceptions caught and wrapped in `AppError` | PASS — `habits.ts` catch block |
| DB auto-creation | Schema runs `CREATE TABLE IF NOT EXISTS` on startup | PASS — `db.ts` `exec()` on module load |
| ✓/✗ prefix convention | `ok()` and `err()` enforce prefix | PASS — `display.ts` |
| Local date handling | `today()` uses `getFullYear/Month/Date` (local) | PASS — `index.ts` `today()` |
| Idempotent `done` | `INSERT OR IGNORE` prevents duplicate completions | PASS — `tracking.ts` `markDone()` |
| Test coverage | Streak, idempotency, date-boundary tests required | PARTIAL — `habits.test.ts` and `stats.test.ts` exist; verify boundary tests |

**Constitution Post-Design Re-check**: No violations introduced by Phase 1 design. Complexity table below is empty (no over-engineering).

## Project Structure

### Documentation (this feature)

```text
specs/001-habit-tracker/
├── plan.md              # This file (speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── cli-commands.md
```

### Source Code

```text
src/
├── package.json          # habit-tracker, bin: { "habit": "dist/index.js" }
├── tsconfig.json         # "strict": true, "module": "NodeNext"
└── src/
    ├── db.ts             # SQLite connection + schema init (singleton)
    ├── errors.ts         # AppError class + ErrorCode type
    ├── habits.ts         # CRUD: addHabit, listHabits, findHabit, deleteHabit
    ├── tracking.ts       # markDone, getCompletionDates, getDoneSetForDate
    ├── stats.ts          # Pure: currentStreak, longestStreak, weeklyRate, computeStats
    ├── display.ts        # ok(), err(), printHabitList(), printStats()
    └── index.ts          # commander program — 5 subcommands wired together

tests/
├── habits.test.ts        # addHabit duplicate/invalid-name, deleteHabit not-found
└── stats.test.ts         # currentStreak, longestStreak, weeklyRate, date boundary
```

**Structure Decision**: Single-project layout. No monorepo or sub-packages needed for a solo CLI tool of this scope.

## Complexity Tracking

*No constitution violations — table omitted.*

---

## Phase 0: Research

**Status**: COMPLETE — all unknowns resolved prior to implementation.

**File**: [research.md](research.md)

### Findings

| Question | Decision | Rationale |
|----------|----------|-----------|
| Date representation | ISO 8601 string `YYYY-MM-DD` in SQLite TEXT column | Lexicographic sort works correctly; no date arithmetic needed in SQL; portable across SQLite versions |
| Streak anchor | Count backward from today; fall back to yesterday if today not yet done | Matches user mental model — a streak is not broken if the user hasn't logged yet today |
| Idempotency mechanism | `INSERT OR IGNORE` at the SQL level (UNIQUE constraint on `habit_id, date`) | Atomic and safe — no read-before-write race |
| Error masking | Catch all SQLite exceptions in the repository layer; re-throw as `AppError` | Keeps raw SQLITE_CONSTRAINT messages away from the user |
| Local date | `new Date()` with `getFullYear/Month/Date` (local) | Spec requires local calendar dates, not UTC |
| Streak break | If neither today nor yesterday is in the completion set, streak = 0 | Consistent with FR-012; longest streak retains historical max independently |
| Stats scope | `stats` command operates on all habits (same as `list`); per-habit stats via the shared `computeStats()` pure function | Reduces surface area; spec acceptance scenario for `stats <name>` is handled by filtering the habits array to the named habit |

---

## Phase 1: Design & Contracts

**Status**: COMPLETE — module interfaces and CLI contracts documented.

**Files**: [data-model.md](data-model.md), [contracts/cli-commands.md](contracts/cli-commands.md), [quickstart.md](quickstart.md)

### Data Model

#### Table: `habits`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | NOT NULL UNIQUE |
| `created_at` | TEXT | NOT NULL DEFAULT `date('now')` |

#### Table: `tracking`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `habit_id` | INTEGER | NOT NULL REFERENCES `habits(id)` ON DELETE CASCADE |
| `date` | TEXT | NOT NULL (ISO 8601 `YYYY-MM-DD`) |
| — | — | UNIQUE(`habit_id`, `date`) |

**Cascade delete**: removing a habit row automatically removes all its tracking rows. No manual cleanup required.

**Pragmas on connection open**:
- `PRAGMA foreign_keys = ON` — enforce referential integrity
- `PRAGMA journal_mode = WAL` — safe concurrent reads (future-proofing)

### Module Interfaces

#### `db.ts`
```typescript
// Exports a single DatabaseType singleton.
// Side-effect: creates ~/.habit-tracker.db and runs CREATE TABLE IF NOT EXISTS on import.
export default db: DatabaseType
```

#### `errors.ts`
```typescript
export type ErrorCode = 'DUPLICATE' | 'NOT_FOUND' | 'INVALID_NAME' | 'DB_ERROR'

export class AppError extends Error {
  code: ErrorCode
  constructor(code: ErrorCode, message: string)
}
```

#### `habits.ts`
```typescript
export interface Habit { id: number; name: string; created_at: string }

export function addHabit(name: string): Habit
  // Validates name (non-empty, ≤ 100 chars). Throws AppError(INVALID_NAME) or AppError(DUPLICATE).

export function listHabits(): Habit[]
  // Returns all habits ordered by created_at ASC, id ASC. Never throws.

export function findHabit(name: string): Habit | undefined
  // Returns undefined if not found. Never throws.

export function deleteHabit(name: string): void
  // Throws AppError(NOT_FOUND) if the habit does not exist.
```

#### `tracking.ts`
```typescript
export type MarkResult = 'created' | 'already_done'

export function markDone(habitId: number, date: string): MarkResult
  // INSERT OR IGNORE. Returns 'already_done' when the row already existed.

export function getCompletionDates(habitId: number): string[]
  // Returns sorted ascending ISO date strings for the given habit.

export function getDoneSetForDate(date: string): Set<number>
  // Returns the set of habit IDs completed on the given date.
```

#### `stats.ts`
```typescript
export interface HabitStats {
  currentStreak: number    // consecutive days ending today or yesterday
  longestStreak: number    // max historical run
  weeklyRate: number       // 0–100, completions in last 7 days / 7 * 100
}

export function currentStreak(dates: readonly string[], today: string): number
export function longestStreak(dates: readonly string[]): number
export function weeklyRate(dates: readonly string[], today: string): number
export function computeStats(dates: readonly string[], today: string): HabitStats
  // Composes the three functions above into a single call.
```

#### `display.ts`
```typescript
export function ok(msg: string): void         // stdout: "✓ {msg}"
export function err(msg: string): void        // stderr: "✗ {msg}"
export function printHabitList(
  habits: Habit[], doneSet: Set<number>, streakMap: Map<number, number>
): void
export function printStats(
  habits: Habit[], statsMap: Map<number, HabitStats>
): void
```

#### `index.ts` (CLI entry point)
```
habit add <name>       → addHabit() → ok()
habit done <name>      → findHabit() + markDone() → ok()
habit list             → listHabits() + getDoneSetForDate() + computeStats() → printHabitList()
habit stats            → listHabits() + getCompletionDates() + computeStats() → printStats()
habit delete <name>    → deleteHabit() → ok()
```

Error routing in `handleError()`:
- `AppError` with `code !== 'DB_ERROR'` → `err(message)` + `process.exit(1)`
- `AppError` with `code === 'DB_ERROR'` → `err(message)` + `process.exit(2)`
- Unknown error → `err(message)` + `process.exit(2)`

---

## Phase 2: Implementation

All five modules are fully implemented. The implementation phases below reflect the correct build order if starting from scratch or rebuilding a module.

### Phase 2.1 — Foundation (db + errors)

**Modules**: `db.ts`, `errors.ts`  
**Deliverable**: Working database connection with schema auto-init; typed error class.

Tasks:
1. `db.ts`: open `~/.habit-tracker.db`, set `foreign_keys = ON` and `journal_mode = WAL`, run `CREATE TABLE IF NOT EXISTS` for `habits` and `tracking`.
2. `errors.ts`: define `ErrorCode` union type and `AppError` extending `Error`.

Acceptance: `import db from './db.js'` does not throw; `db.pragma('foreign_keys')` returns `[{ foreign_keys: 1 }]`.

### Phase 2.2 — Habit CRUD (habits.ts)

**Depends on**: Phase 2.1  
**Deliverable**: `addHabit`, `listHabits`, `findHabit`, `deleteHabit`.

Tasks:
1. Implement `validateName` — rejects empty/whitespace and names > 100 chars with `AppError(INVALID_NAME)`.
2. Implement `addHabit` — `INSERT … RETURNING`; catches UNIQUE constraint and re-throws as `AppError(DUPLICATE)`.
3. Implement `listHabits` — `SELECT` ordered by `created_at ASC, id ASC`.
4. Implement `findHabit` — `SELECT WHERE name = ?`, returns `undefined` if not found.
5. Implement `deleteHabit` — finds habit (throws `NOT_FOUND` if absent), deletes by `id` (cascade handles tracking rows).

Acceptance: duplicate `addHabit` throws `AppError('DUPLICATE')`; `deleteHabit('nonexistent')` throws `AppError('NOT_FOUND')`.

### Phase 2.3 — Tracking (tracking.ts)

**Depends on**: Phase 2.1  
**Deliverable**: `markDone`, `getCompletionDates`, `getDoneSetForDate`.

Tasks:
1. Implement `markDone` — `INSERT OR IGNORE`; infer result from `changes`.
2. Implement `getCompletionDates` — `SELECT date ORDER BY date ASC`.
3. Implement `getDoneSetForDate` — `SELECT habit_id WHERE date = ?`; return as `Set<number>`.

Acceptance: calling `markDone(id, '2026-04-30')` twice returns `'created'` then `'already_done'`; only one row in DB.

### Phase 2.4 — Statistics (stats.ts)

**Depends on**: nothing (pure functions)  
**Deliverable**: `currentStreak`, `longestStreak`, `weeklyRate`, `computeStats`.

Tasks:
1. Implement `prevDay(date)` helper — subtract one calendar day from ISO string using UTC arithmetic.
2. Implement `currentStreak` — anchor at today if present, else yesterday if present, else 0; walk backward counting consecutive days.
3. Implement `longestStreak` — single-pass over sorted dates, counting consecutive runs.
4. Implement `weeklyRate` — count completions in the last 7 days (inclusive of today); multiply by `100/7` and round.
5. Implement `computeStats` — compose all three.

Acceptance (unit tests in `stats.test.ts`):
- `currentStreak(['2026-04-28','2026-04-29','2026-04-30'], '2026-04-30')` → 3
- `currentStreak(['2026-04-29'], '2026-04-30')` → 1 (yesterday counts)
- `currentStreak(['2026-04-28'], '2026-04-30')` → 0 (gap)
- `longestStreak(['2026-04-01','2026-04-02','2026-04-05'])` → 2
- `weeklyRate(['2026-04-24','2026-04-25','2026-04-26','2026-04-27','2026-04-28'], '2026-04-30')` → 71

### Phase 2.5 — Display (display.ts)

**Depends on**: Phase 2.2, Phase 2.4 (types only)  
**Deliverable**: `ok`, `err`, `printHabitList`, `printStats`.

Tasks:
1. Implement `ok` / `err` using chalk green/red prefix symbols.
2. Implement `printHabitList` — dynamic column widths based on habit name lengths; ✓/– status column; streak in yellow if > 0.
3. Implement `printStats` — name, current streak, longest streak, 7-day rate columns.

Acceptance: empty habits list → prints no-habits message; column widths adapt to longest habit name.

### Phase 2.6 — CLI Entry Point (index.ts)

**Depends on**: Phases 2.2–2.5  
**Deliverable**: All five subcommands wired and tested end-to-end.

Tasks:
1. `today()` helper using local date fields.
2. `add <name>` → `addHabit` → `ok`.
3. `done <name>` → `findHabit` (exit 1 if absent) → `markDone` → `ok` (two messages: "done today" vs "already done today").
4. `list` → `listHabits` + `getDoneSetForDate` + per-habit `computeStats` → `printHabitList`.
5. `stats` → `listHabits` + per-habit `getCompletionDates` + `computeStats` → `printStats`.
6. `delete <name>` → `deleteHabit` → `ok`.
7. `handleError` — routes `AppError` codes to exit 1 vs 2; masks all other errors.

Acceptance: all acceptance scenarios from spec pass; `habit done exercise` twice exits 0 both times.

---

## Testing Plan

### Unit Tests (must pass `npm test`)

| File | Scenarios |
|------|-----------|
| `stats.test.ts` | `currentStreak` with today done, only yesterday done, gap → 0; `longestStreak` with gap; `weeklyRate` at 5/7 days; midnight-boundary date (yesterday is last done) |
| `habits.test.ts` | `addHabit` with duplicate name → DUPLICATE error; `addHabit` with empty string → INVALID_NAME; `deleteHabit` non-existent → NOT_FOUND |

### Compile Check

```bash
cd src && npm run typecheck    # tsc --noEmit — zero errors required
```

### Manual Smoke Test Sequence

```bash
cd src && npm run build
node dist/index.js add exercise        # ✓ Added habit: "exercise"
node dist/index.js add exercise        # ✗ A habit named "exercise" already exists.
node dist/index.js add ""              # ✗ Habit name cannot be empty.
node dist/index.js done exercise       # ✓ Marked "exercise" as done today
node dist/index.js done exercise       # ✓ (idempotent — second run exits 0)
node dist/index.js list                # table with exercise, streak 1
node dist/index.js stats               # table with exercise stats
node dist/index.js delete exercise     # ✓ Deleted habit: "exercise"
node dist/index.js done exercise       # ✗ No habit named "exercise" found.
```

---

## Spec Alignment Matrix

| FR / NFR | Module | Status |
|----------|--------|--------|
| FR-001 `habit add <name>` | `habits.ts` `addHabit` + `index.ts` | Implemented |
| FR-002 duplicate rejection | `habits.ts` UNIQUE catch → `AppError(DUPLICATE)` | Implemented |
| FR-003 `habit done <name>` | `tracking.ts` `markDone` + `index.ts` | Implemented |
| FR-004 `done` idempotent | `INSERT OR IGNORE` in `markDone` | Implemented |
| FR-005 `habit list` with streaks | `index.ts` list command | Implemented |
| FR-006 `habit stats <name>` | `stats.ts` + `index.ts` stats command | Implemented |
| FR-007 `habit delete <name>` | `habits.ts` `deleteHabit` + cascade | Implemented |
| FR-008 `✓` on success | `display.ts` `ok()` | Implemented |
| FR-009 `✗` on error, exit codes 1/2 | `display.ts` `err()` + `handleError()` | Implemented |
| FR-010 no raw SQLite errors | catch in `habits.ts` wraps all exceptions | Implemented |
| FR-011 DB at `~/.habit-tracker.db` auto-created | `db.ts` | Implemented |
| FR-012 local date streaks | `today()` in `index.ts`, `prevDay` uses UTC arithmetic on local date strings | Implemented |
| FR-013 < 200 ms | synchronous SQLite, no network | Verified by design |
| FR-014 space-containing names | shell quoting + TEXT column | Supported |
| NFR-001 strict TypeScript | `tsconfig.json` `"strict": true` | Implemented |
| NFR-002 synchronous DB | `better-sqlite3` `.get/.all/.run` only | Implemented |
| NFR-003 pure business logic | `stats.ts` has no DB imports | Implemented |
| NFR-004 required unit tests | `stats.test.ts`, `habits.test.ts` | Implemented (verify boundary cases) |
| NFR-005 commander + chalk | `index.ts`, `display.ts` | Implemented |
| NFR-006 Node.js 22, macOS/Linux | no platform APIs; `homedir()` is cross-platform | Implemented |

---

## Open Items

| # | Item | Owner | Priority |
|---|------|-------|----------|
| 1 | `habit done` output message diverges from spec — spec says `✓ "exercise" marked as done for today` but implementation prints `✓ Marked "exercise" as done today`. Align wording. | Implementation | P2 |
| 2 | `habit add` output diverges — spec says `✓ Habit "exercise" added` but implementation prints `✓ Added habit: "exercise"`. Align wording. | Implementation | P2 |
| 3 | `habit done` already-done case — spec says print `✓ "exercise" already done today` but current code prints the same message as first-time done. Add distinct message for `already_done` result. | Implementation | P2 |
| 4 | `habit stats <name>` — spec acceptance scenario shows per-habit stats but current `stats` command takes no argument (shows all habits). Add optional `<name>` argument to filter to a single habit. | Implementation | P3 |
| 5 | Date-boundary unit test — verify `currentStreak` correctly returns 1 when only yesterday is done (not today). Confirm this case is in `stats.test.ts`. | Testing | P1 |
| 6 | `habit delete` output — spec says `✓ Habit "exercise" deleted` but code prints `✓ Deleted habit: "exercise"`. Align wording. | Implementation | P3 |
