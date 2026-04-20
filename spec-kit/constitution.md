# Project Constitution — Habit Tracker CLI

*Governing principles for all development on this project.*
*Created as Step 2 of the Spec Kit SDD workflow (equivalent to `/speckit.constitution`).*

---

## Mission

Build a reliable, fast, and user-friendly command-line habit tracker that
helps users build consistent daily routines through honest progress tracking.

---

## Code Quality Standards

- **Language:** TypeScript strict mode (`"strict": true`)
- **Runtime:** Node.js 20 LTS
- **Database:** SQLite via `better-sqlite3` (synchronous, no async complexity)
- **Tests:** Required for all business logic (streak calculation, date logic)
- **Error handling:** User-facing errors go to stderr with a clear message;
  never expose raw SQLite errors to the user
- **Exit codes:** 0 on success, 1 on user error, 2 on internal error

## UX Standards

- Every successful mutation prints a confirmation message beginning with `✓`
- Every error message begins with `✗`
- All tabular output uses consistent column widths
- No interactive prompts — all input is via command arguments
- Commands must complete in < 200 ms on a modern developer laptop

## Architecture Principles

- Database schema changes require a migration (no silent drops)
- Business logic (streak calculation, statistics) lives in pure functions,
  separate from database access
- No global mutable state outside the SQLite connection

## Specification Compliance

- All implemented behaviour must trace to a task in `tasks.md`
- Any change to behaviour must update `spec.md` before the code changes
- The `spec.md` is the authoritative definition of correct behaviour

## Testing Requirements

- Unit tests for: streak calculation, idempotency of `done` command,
  date boundary behaviour (midnight rollover)
- Integration tests are not required for v1 but the architecture must not
  prevent them from being added
