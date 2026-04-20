# Epic 02 — Daily Tracking

*BMAD Method | Phase 3: Solutioning | Agent: PM (John)*
*References: PRD FR-02, architecture.md → tracking.ts*

## Goal

Users can mark habits as completed for today, with idempotency guaranteed.

## Stories

### Story 02.1 — Mark Habit Done

**As a** user who has completed a habit,
**I want to** run `habit done "name"` to record my completion,
**so that** my streak stays alive.

**Implementation tasks:**
1. Implement `markDone(habitId, date)` in `tracking.ts`
   - Use `INSERT OR IGNORE INTO tracking (habit_id, date) VALUES (?, ?)`
   - Return `'created'` if inserted, `'already_done'` if ignored
2. Implement `getCompletionDates(habitId)` in `tracking.ts`
   - `SELECT date FROM tracking WHERE habit_id = ? ORDER BY date ASC`
3. In `index.ts` `done` command:
   - Look up habit by name (throw `NOT_FOUND` if missing)
   - Call `markDone` with today's ISO date
   - Print `✓ Marked "name" as done today` (both result codes)

**Acceptance criteria:** AC-03.1, AC-03.2, AC-03.3, AC-03.4

## Definition of Done
- `habit done "name"` correctly records completion
- Running the command twice on the same day does not create duplicate records
- Running on a non-existent habit name prints an error and exits 1
- `getCompletionDates` returns sorted, deduplicated date strings
