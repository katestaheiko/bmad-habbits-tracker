# Epic 01 — Habit Management

*BMAD Method | Phase 3: Solutioning | Agent: PM (John)*
*References: PRD FR-01, architecture.md → habits.ts*

## Goal

Users can create, view, and delete habits through the CLI.

## Stories

### Story 01.1 — Add Habit Command

**As a** user,
**I want to** run `habit add "name"` to create a new habit,
**so that** I can start tracking it from today.

**Implementation tasks:**
1. Implement `addHabit(name)` in `habits.ts`
   - Validate: name must be 1–100 chars (throw `INVALID_NAME`)
   - Insert into `habits` table (throw `DUPLICATE` on conflict)
   - Return the inserted `Habit` object
2. Register `habit add <name>` command in `index.ts`
3. Print `✓ Added habit: "name"` on success
4. Print `✗ Error: ...` to stderr on failure, exit 1

**Acceptance criteria:** AC-01.1, AC-01.2, AC-01.3, AC-01.4

---

### Story 01.2 — List Habits Command

**As a** user,
**I want to** run `habit list` to see all my habits with today's status,
**so that** I know what's done and what remains.

**Implementation tasks:**
1. Implement `listHabits()` in `habits.ts`
2. In `index.ts` `list` command: fetch habits + today's completion set + streaks
3. Implement `printHabitList(habits, doneSet, streakMap)` in `display.ts`
   - Columns: Name | Status (✓ / –) | Current Streak
   - Empty-state message if no habits exist

**Acceptance criteria:** AC-02.1, AC-02.2, AC-02.3, AC-02.4

---

### Story 01.3 — Delete Habit Command

**As a** user,
**I want to** run `habit delete "name"` to permanently remove a habit,
**so that** it no longer appears in my list.

**Implementation tasks:**
1. Implement `deleteHabit(name)` in `habits.ts`
   - Throw `NOT_FOUND` if habit does not exist
   - DELETE triggers cascade removal of all tracking rows
2. Register `habit delete <name>` in `index.ts`
3. Print `✓ Deleted habit: "name"` on success

**Acceptance criteria:** AC-05.1, AC-05.2, AC-05.3

## Definition of Done
- All stories implemented and unit-tested
- `habit add`, `habit list`, `habit delete` work end-to-end
- Duplicate and not-found errors produce correct stderr output
