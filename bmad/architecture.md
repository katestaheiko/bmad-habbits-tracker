# Architecture Document — Habit Tracker CLI

*Created using BMAD Method, Phase 3: Solutioning.*
*Agent: Architect (Winston) | Workflow: `bmad-create-architecture`*

---

## Architecture Decision Records

### ADR-01: SQLite for persistence

**Context:** Need a zero-config, local-only database that survives process
restarts without requiring a database server.

**Decision:** Use SQLite via `better-sqlite3`.

**Consequences:** Synchronous API simplifies code (no async/await); single-file
database is easy to back up; `better-sqlite3` is the fastest Node.js SQLite
binding but requires native compilation (handled by npm install).

### ADR-02: TypeScript strict mode

**Context:** Domain logic (streak calculation) has subtle off-by-one edge cases.
Type safety catches categories of bugs at compile time.

**Decision:** TypeScript 5 with `"strict": true`, `"noUncheckedIndexedAccess": true`.

**Consequences:** More verbose type annotations but significantly fewer runtime
type errors; all edge cases in stats functions must be handled explicitly.

### ADR-03: Pure functions for statistics

**Context:** Streak and rate calculations are complex enough to require unit
testing but must also be fast.

**Decision:** `stats.ts` contains only pure functions that accept arrays of ISO
date strings and return numbers. No database access inside `stats.ts`.

**Consequences:** Statistics are fully unit-testable without a database; the
database layer returns raw date arrays and the stats layer processes them.
This is the most important architectural boundary in the system.

### ADR-04: Commander for CLI

**Context:** Need argument parsing with subcommands, help text, and version flag.

**Decision:** `commander` v12 — mature, tree-shakeable, well-typed.

**Consequences:** Standard CLI UX patterns (--help, --version) come for free;
argument validation is handled by commander's built-in required-argument check.

---

## System Overview

```
┌─────────────────────────────────────────────┐
│  CLI Layer (index.ts)                        │
│  - Parses commands via commander             │
│  - Routes to domain functions                │
│  - Catches errors → stderr                   │
└─────────┬───────────────────────────────────┘
          │ calls
┌─────────▼───────────────────────────────────┐
│  Domain Layer                                │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  habits.ts   │  │  tracking.ts         │ │
│  │  CRUD ops    │  │  markDone, getDates  │ │
│  └──────┬───────┘  └──────────┬───────────┘ │
│         │                     │             │
│  ┌──────▼─────────────────────▼───────────┐ │
│  │  db.ts — SQLite connection singleton   │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  stats.ts — pure functions only      │  │
│  │  currentStreak, longestStreak,       │  │
│  │  weeklyRate                          │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
          │ reads/writes
┌─────────▼───────────────────────────────────┐
│  ~/.habit-tracker.db (SQLite file)           │
│  tables: habits, tracking                    │
└─────────────────────────────────────────────┘
```

---

## Data Model

```sql
-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL DEFAULT (date('now'))
);

-- Completion tracking
CREATE TABLE IF NOT EXISTS tracking (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date     TEXT    NOT NULL,          -- ISO 8601 date: YYYY-MM-DD
  UNIQUE(habit_id, date)              -- prevents duplicate completions
);
```

---

## Module Interface Contracts

### `db.ts`
```typescript
export const db: Database  // better-sqlite3 instance, initialised on import
```

### `habits.ts`
```typescript
export interface Habit { id: number; name: string; created_at: string }

export function addHabit(name: string): Habit
// Throws: 'DUPLICATE' if name taken, 'INVALID_NAME' if empty or > 100 chars

export function listHabits(): Habit[]
// Returns: habits ordered by created_at ASC

export function findHabit(name: string): Habit | undefined
// Returns: exact match or undefined

export function deleteHabit(name: string): void
// Throws: 'NOT_FOUND' if no habit with that name
```

### `tracking.ts`
```typescript
export type MarkResult = 'created' | 'already_done'

export function markDone(habitId: number, date: string): MarkResult
export function getCompletionDates(habitId: number): string[]
// Returns: sorted ISO date strings, ascending
```

### `stats.ts`
```typescript
export function currentStreak(dates: readonly string[], today: string): number
export function longestStreak(dates: readonly string[]): number
export function weeklyRate(dates: readonly string[], today: string): number
// weeklyRate returns 0–100 (percentage)
```

---

## Error Taxonomy

| Code | Meaning | Exit Code |
|---|---|---|
| `DUPLICATE` | Habit name already exists | 1 |
| `NOT_FOUND` | Habit name does not exist | 1 |
| `INVALID_NAME` | Name empty or > 100 chars | 1 |
| `DB_ERROR` | Unexpected SQLite failure | 2 |

---

## Implementation Readiness Assessment

- [x] All module interfaces are defined with precise types
- [x] Error taxonomy is complete and mapped to exit codes
- [x] Data model handles all acceptance test scenarios
- [x] Pure function boundary isolates testable logic from I/O
- [x] No circular dependencies in module graph
- [x] Performance: all operations are O(n) in habit count at worst; n is bounded by human scale (< 100 habits)

**Verdict: PASS — ready for epic and story creation**
