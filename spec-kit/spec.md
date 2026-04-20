# Feature Specification — Habit Tracker CLI

*Created as Step 3 of the Spec Kit SDD workflow (equivalent to `/speckit.specify`).*
*Technology-agnostic. Describes WHAT to build, not HOW.*

---

## Feature Summary

A command-line application that allows a user to define personal habits,
record daily completion of those habits, and review streaks and progress
statistics over time.

The application stores all data locally on the user's machine. No network
access is required. Multiple invocations on the same day are safe.

---

## User Stories

### US-01: Add a Habit

**As a** user who wants to build a new routine,
**I want to** add a named habit to my tracker,
**so that** I can start recording its daily completion.

**Acceptance Criteria:**
- AC-01.1: Given I run `habit add "Read 30 minutes"`, the habit is saved and
  a confirmation is displayed
- AC-01.2: Given a habit with the same name already exists, the command fails
  with a clear error message (duplicate names are not allowed)
- AC-01.3: Given an empty name or a name exceeding 100 characters, the command
  fails with a validation error
- AC-01.4: Habit names are case-sensitive ("read" and "Read" are different habits)

### US-02: List All Habits

**As a** user starting my day,
**I want to** see all my habits and which ones I have already completed today,
**so that** I know what remains to be done.

**Acceptance Criteria:**
- AC-02.1: The output lists every habit with its name and today's completion
  status (done / not done)
- AC-02.2: Each row also shows the habit's current streak count
- AC-02.3: If no habits exist, a helpful empty-state message is shown
- AC-02.4: The list is ordered by creation date (oldest first)

### US-03: Mark a Habit as Done

**As a** user who has completed a habit,
**I want to** mark it as done for today,
**so that** my streak is maintained.

**Acceptance Criteria:**
- AC-03.1: Given I run `habit done "Read 30 minutes"` and today is not already
  marked, the completion is recorded and a confirmation is displayed
- AC-03.2: Given the habit is already marked done today, the command succeeds
  silently (idempotent) — no error, no duplicate record
- AC-03.3: Given the habit name does not exist, the command fails with a
  clear error
- AC-03.4: Partial name matching is not supported; the name must match exactly

### US-04: View Statistics

**As a** user reviewing my progress,
**I want to** see streak and completion-rate statistics for all my habits,
**so that** I can evaluate my consistency.

**Acceptance Criteria:**
- AC-04.1: Output shows each habit's current streak (consecutive days ending
  today or yesterday)
- AC-04.2: Output shows each habit's longest-ever streak
- AC-04.3: Output shows the 7-day completion rate (completions / 7 days × 100%)
- AC-04.4: Habits with no completions show a streak of 0 and a rate of 0%

### US-05: Delete a Habit

**As a** user who no longer wants to track a habit,
**I want to** delete it,
**so that** it no longer appears in my list or statistics.

**Acceptance Criteria:**
- AC-05.1: Given I run `habit delete "name"`, the habit and all its tracking
  history are permanently removed
- AC-05.2: The command prints a confirmation after successful deletion
- AC-05.3: Given the habit does not exist, the command fails with a clear error

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | All commands complete in < 200 ms on a modern developer laptop |
| NFR-02 | Data is persisted across terminal sessions and machine restarts |
| NFR-03 | Running the same command twice never creates duplicate records |
| NFR-04 | The application does not require network access |
| NFR-05 | All user-visible error messages are written to stderr |

---

## Constraints

- No web or mobile interface — CLI only for v1
- No multi-user support — single local user per data store
- No habit scheduling (e.g., weekdays only) — every habit is daily
- The "current day" is determined by the system clock at command invocation time
