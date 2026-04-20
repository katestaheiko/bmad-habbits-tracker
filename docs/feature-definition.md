# Feature Definition — Habit Tracker CLI

## Overview

A command-line habit tracking tool that helps users build consistent daily
routines by logging completion and visualising streaks.

Chosen to compare SDD methodologies because it has:
- Clear, bounded domain (no ambiguity about what it does)
- Non-trivial business logic (streak calculation, weekly/monthly rollups)
- Both CRUD operations and stateful logic — exercises full specification depth
- No external API dependencies — fully self-contained for demo purposes

---

## Scope

### In Scope

- Create, list, and delete named habits
- Mark a habit as completed for the current calendar day
- Persist all data locally in a SQLite database
- Calculate and display current streak (consecutive days completed)
- Show a weekly completion summary per habit
- CLI interface only (no web UI, no mobile)

### Out of Scope

- User authentication / multi-user support
- Cloud sync or remote storage
- Habit scheduling (e.g., "only on weekdays")
- Notifications or reminders
- Data import/export

---

## Inputs

| Input | Type | Description |
|---|---|---|
| Habit name | String | Human-readable label, max 100 chars |
| Date | ISO date (auto) | Defaults to today; not user-overridable in v1 |
| Command | CLI argument | `add`, `list`, `done`, `delete`, `stats` |

---

## Expected Outputs

| Output | Format | Description |
|---|---|---|
| Habit list | Terminal table | Name, created date, today's status (✓/–) |
| Completion confirmation | Terminal message | "✓ Marked 'Read 30 minutes' as done today" |
| Streak stats | Terminal table | Habit name, current streak, longest streak, 7-day rate |
| Error messages | Terminal stderr | Validation failures, duplicate names, not-found |

---

## Success Criteria

1. `habit add "name"` persists a new habit and confirms creation
2. `habit list` shows all habits with correct done/undone status for today
3. `habit done "name"` marks the habit and is idempotent (safe to run twice)
4. `habit stats` shows correct streak counts (validated by unit tests)
5. `habit delete "name"` removes the habit and all its tracking history
6. All commands complete in < 200 ms on a typical developer laptop

---

## Domain Model

```
Habit
  id          INTEGER PK
  name        TEXT UNIQUE NOT NULL
  created_at  TEXT (ISO date)

Tracking
  id          INTEGER PK
  habit_id    INTEGER FK → Habit.id
  date        TEXT (ISO date)
  UNIQUE(habit_id, date)
```

Streak definition: the number of consecutive calendar days (ending today or
yesterday) on which the habit was marked done. If today is not yet marked,
the streak counts backward from yesterday.
