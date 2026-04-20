# Technical Implementation Plan — Habit Tracker CLI

*Created as Step 4 of the Spec Kit SDD workflow (equivalent to `/speckit.plan`).*
*Technology-specific. Describes HOW to build what spec.md defines.*

---

## Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript 5 (strict) | Type safety for domain model, wide tooling |
| Runtime | Node.js 20 LTS | Stable, available on all developer machines |
| Database | SQLite via `better-sqlite3` | Zero-config, file-based, synchronous API |
| CLI framework | `commander` | Mature, well-typed, minimal overhead |
| Terminal output | `chalk` | Cross-platform colour, streak indicators |
| Test runner | `vitest` | Fast, ESM-native, minimal config |
| Build | `tsc` | Direct TypeScript compilation, no bundler needed |

---

## Project Layout

```
src/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        ← CLI entry point, command registration
│   ├── db.ts           ← SQLite connection + schema initialisation
│   ├── habits.ts       ← Habit CRUD (addHabit, listHabits, deleteHabit)
│   ├── tracking.ts     ← Daily completion logic (markDone, isMarkedToday)
│   ├── stats.ts        ← Streak + rate calculations (pure functions)
│   └── display.ts      ← Terminal table formatting, colour helpers
└── tests/
    ├── stats.test.ts   ← Unit tests for streak and rate logic
    └── habits.test.ts  ← Unit tests for CRUD invariants
```

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS habits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS tracking (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date     TEXT    NOT NULL,
  UNIQUE(habit_id, date)
);
```

`PRAGMA foreign_keys = ON` is set at connection time so `DELETE CASCADE`
removes tracking rows when a habit is deleted.

---

## Module Responsibilities

### `db.ts`
- Opens (or creates) the SQLite database at `~/.habit-tracker.db`
- Runs schema initialisation on first open
- Exports a single `db` instance used by all other modules

### `habits.ts`
- `addHabit(name: string): Habit` — validates, inserts, returns new habit
- `listHabits(): Habit[]` — returns all habits ordered by `created_at`
- `findHabit(name: string): Habit | undefined` — exact name lookup
- `deleteHabit(name: string): void` — deletes habit + cascaded tracking rows

### `tracking.ts`
- `markDone(habitId: number, date: string): 'created' | 'already_done'`
  — inserts or ignores (idempotent via `INSERT OR IGNORE`)
- `getCompletionDates(habitId: number): string[]`
  — returns all ISO dates for a habit, sorted ascending

### `stats.ts` (pure functions, no DB access)
- `currentStreak(dates: string[], today: string): number`
- `longestStreak(dates: string[]): number`
- `weeklyRate(dates: string[], today: string): number` — returns 0–100

### `display.ts`
- `printHabitList(habits, trackingMap, streakMap)` — renders table
- `printStats(habits, statsMap)` — renders stats table
- `ok(msg)` / `err(msg)` — prefixed confirmation/error messages

### `index.ts`
- Registers commands: `add`, `list`, `done`, `stats`, `delete`
- Wires command arguments to module functions
- Catches thrown errors and prints them to stderr, then exits with code 1

---

## Streak Algorithm

```
currentStreak(dates, today):
  streak = 0
  cursor = today
  while cursor in dates OR (streak == 0 AND yesterday(cursor) in dates):
    if cursor not in dates: cursor = yesterday(cursor)
    while cursor in dates:
      streak++
      cursor = yesterday(cursor)
  return streak
```

Simplified: count backward from today (or yesterday if today is not done),
stopping at the first missing date.

---

## Error Strategy

| Scenario | Behaviour |
|---|---|
| Duplicate habit name | Exit 1, message to stderr |
| Habit not found | Exit 1, message to stderr |
| Name too long / empty | Exit 1, message to stderr |
| SQLite internal error | Exit 2, generic message to stderr |

---

## Build & Distribution

```bash
npm run build          # tsc → dist/
npm link               # symlinks `habit` to dist/index.js
```

`package.json` sets `"bin": { "habit": "dist/index.js" }` and
`dist/index.js` has a `#!/usr/bin/env node` shebang.
