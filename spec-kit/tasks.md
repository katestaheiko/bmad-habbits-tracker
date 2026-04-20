# Task List — Habit Tracker CLI

*Created as Step 5 of the Spec Kit SDD workflow (equivalent to `/speckit.tasks`).*
*Derived from plan.md. Each task is independently implementable.*

---

## Epic: Project Setup

- [x] **T-001** Initialise Node.js project with `package.json`, `tsconfig.json`
- [x] **T-002** Install dependencies: `better-sqlite3`, `commander`, `chalk`
- [x] **T-003** Install dev dependencies: `typescript`, `@types/*`, `vitest`
- [x] **T-004** Configure `tsconfig.json` with strict mode, `outDir: dist`
- [x] **T-005** Add npm scripts: `build`, `test`, `dev`

## Epic: Database Layer (`db.ts`)

- [x] **T-006** Create `db.ts`: open SQLite at `~/.habit-tracker.db`
- [x] **T-007** Write `CREATE TABLE IF NOT EXISTS habits` DDL
- [x] **T-008** Write `CREATE TABLE IF NOT EXISTS tracking` DDL with UNIQUE constraint
- [x] **T-009** Enable `PRAGMA foreign_keys = ON` on connection open
- [x] **T-010** Export typed `db` singleton

## Epic: Habit CRUD (`habits.ts`)

- [x] **T-011** Implement `addHabit(name)`: validate length (1–100), INSERT, return Habit
- [x] **T-012** Implement `listHabits()`: SELECT * ORDER BY created_at
- [x] **T-013** Implement `findHabit(name)`: exact-match SELECT, return undefined if missing
- [x] **T-014** Implement `deleteHabit(name)`: DELETE with cascade, throw if not found

## Epic: Daily Tracking (`tracking.ts`)

- [x] **T-015** Implement `markDone(habitId, date)`: INSERT OR IGNORE, return status
- [x] **T-016** Implement `getCompletionDates(habitId)`: SELECT all dates ASC

## Epic: Statistics (`stats.ts`)

- [x] **T-017** Implement `currentStreak(dates, today)`: count backward from today/yesterday
- [x] **T-018** Implement `longestStreak(dates)`: sliding window over sorted dates
- [x] **T-019** Implement `weeklyRate(dates, today)`: count completions in last 7 days
- [x] **T-020** Write unit tests for `currentStreak`: empty, single day, broken streak, today not done
- [x] **T-021** Write unit tests for `longestStreak`: empty, single run, multiple runs
- [x] **T-022** Write unit tests for `weeklyRate`: full week, partial week, empty

## Epic: Display Layer (`display.ts`)

- [x] **T-023** Implement `ok(msg)` and `err(msg)` helpers with chalk prefixes
- [x] **T-024** Implement `printHabitList(habits, doneSet, streakMap)`: aligned table
- [x] **T-025** Implement `printStats(habits, statsMap)`: aligned stats table

## Epic: CLI Entry Point (`index.ts`)

- [x] **T-026** Register `habit add <name>` command → `addHabit`, `ok()` on success
- [x] **T-027** Register `habit list` command → `listHabits`, `printHabitList`
- [x] **T-028** Register `habit done <name>` command → `findHabit`, `markDone`, `ok()`
- [x] **T-029** Register `habit stats` command → `listHabits`, stats functions, `printStats`
- [x] **T-030** Register `habit delete <name>` command → `deleteHabit`, `ok()`
- [x] **T-031** Global error handler: catch errors, print to stderr, exit 1

## Epic: Build & Distribution

- [x] **T-032** Add `"bin": { "habit": "dist/index.js" }` to `package.json`
- [x] **T-033** Add shebang `#!/usr/bin/env node` to `index.ts`
- [x] **T-034** Verify `npm run build && npm link && habit list` works end-to-end

---

## Traceability Matrix

| Task(s) | Spec Reference |
|---|---|
| T-011 to T-014 | US-01, US-05, AC-01.1–01.4 |
| T-015 to T-016 | US-03, AC-03.1–03.4 |
| T-017 to T-022 | US-04, AC-04.1–04.4 |
| T-023 to T-025 | US-02, AC-02.1–02.4 |
| T-026 to T-031 | US-01–05 (all commands) |
| All tasks | NFR-01 (< 200 ms), NFR-03 (idempotency) |
