# Feature Specification: Habit Tracker CLI

**Feature Branch**: `001-habit-tracker`  
**Created**: 2026-04-30  
**Status**: Draft  

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a Named Habit (Priority: P1)

A user wants to start tracking a new habit by giving it a name. Running `habit add <name>` registers the habit in the local database so it can be tracked going forward.

**Why this priority**: Without the ability to create a habit, no other feature can function. This is the entry point for all subsequent workflows and is the minimum viable slice of the product.

**Independent Test**: Can be fully tested by running `habit add exercise` against a fresh database and confirming the habit is persisted — delivers immediate value as the foundation for all tracking.

**Acceptance Scenarios**:

1. **Given** no habit named "exercise" exists, **When** the user runs `habit add exercise`, **Then** the system prints `✓ Habit "exercise" added` and the habit is stored in the database.
2. **Given** a habit named "exercise" already exists, **When** the user runs `habit add exercise` again, **Then** the system prints an error message beginning with `✗` to stderr, exits with code 1, and does not create a duplicate.
3. **Given** the user provides an empty or whitespace-only name, **When** `habit add ""` is run, **Then** the system prints an error beginning with `✗` to stderr and exits with code 1 without modifying the database.

---

### User Story 2 - Mark a Habit as Done for Today (Priority: P2)

A user wants to record that they completed a habit today. Running `habit done <name>` logs today's completion for that habit, advancing or maintaining the streak.

**Why this priority**: Recording daily completions is the core tracking action. Without it, the data required for streaks and statistics cannot be accumulated.

**Independent Test**: Can be tested by adding a habit and then running `habit done exercise` — the command should confirm completion and the streak count should increment when listed.

**Acceptance Scenarios**:

1. **Given** a habit "exercise" exists and has not been marked done today, **When** the user runs `habit done exercise`, **Then** the system prints `✓ "exercise" marked as done for today` and records the completion.
2. **Given** a habit "exercise" has already been marked done today, **When** the user runs `habit done exercise` again, **Then** the system prints `✓ "exercise" already done today` (idempotent — no duplicate entry is created) and exits with code 0.
3. **Given** no habit named "reading" exists, **When** the user runs `habit done reading`, **Then** the system prints an error beginning with `✗` to stderr and exits with code 1.

---

### User Story 3 - List All Habits with Streaks (Priority: P3)

A user wants an overview of all their habits and how consistently they have been completing them. Running `habit list` displays a formatted table of all habits with each one's current streak.

**Why this priority**: Visibility into progress is the primary motivator for habit-forming behaviour. Once habits are created and completions recorded, this command delivers the first meaningful feedback loop.

**Independent Test**: Can be tested by adding two habits with different completion histories and confirming the list shows both with correct streak values and consistent column formatting.

**Acceptance Scenarios**:

1. **Given** two habits exist with streaks of 3 and 0, **When** the user runs `habit list`, **Then** the output is a formatted table with a header row, each habit's name, and its current streak in days, using consistent column widths.
2. **Given** no habits exist, **When** the user runs `habit list`, **Then** the system prints a message such as `No habits tracked yet.` and exits with code 0.
3. **Given** a habit has been done every day for the past 7 days, **When** the user runs `habit list`, **Then** the streak displayed for that habit is 7.

---

### User Story 4 - View Statistics for a Habit (Priority: P4)

A user wants to understand their performance on a specific habit in depth. Running `habit stats <name>` shows the current streak, longest streak ever, and the weekly completion rate for that habit.

**Why this priority**: Detailed statistics give users the insight needed to understand patterns and stay motivated. This builds on the list command's summary view with habit-level depth.

**Independent Test**: Can be tested by adding a habit, recording completions across multiple days (including gaps), and confirming that `habit stats` reports accurate current streak, longest streak, and weekly completion rate.

**Acceptance Scenarios**:

1. **Given** a habit "exercise" with a 5-day current streak, a 10-day longest streak, and 5 completions in the last 7 days, **When** the user runs `habit stats exercise`, **Then** the output shows current streak: 5, longest streak: 10, and weekly completion rate: 71%.
2. **Given** a habit "exercise" with no completions recorded, **When** the user runs `habit stats exercise`, **Then** the output shows current streak: 0, longest streak: 0, and weekly completion rate: 0%.
3. **Given** no habit named "meditation" exists, **When** the user runs `habit stats meditation`, **Then** the system prints an error beginning with `✗` to stderr and exits with code 1.

---

### User Story 5 - Delete a Habit (Priority: P5)

A user wants to permanently remove a habit and all its associated completion history from the database. Running `habit delete <name>` removes the habit entirely.

**Why this priority**: The ability to remove habits keeps the tracker tidy and relevant. It is the least critical feature because the tracker is still useful without it, but it is required for a complete lifecycle.

**Independent Test**: Can be tested by adding a habit, deleting it, and confirming it no longer appears in `habit list` and that `habit done <name>` returns an error.

**Acceptance Scenarios**:

1. **Given** a habit "exercise" exists, **When** the user runs `habit delete exercise`, **Then** the system prints `✓ Habit "exercise" deleted` and the habit no longer appears in `habit list`.
2. **Given** a habit "exercise" is deleted, **When** the user runs `habit done exercise`, **Then** the system prints an error beginning with `✗` to stderr and exits with code 1.
3. **Given** no habit named "yoga" exists, **When** the user runs `habit delete yoga`, **Then** the system prints an error beginning with `✗` to stderr and exits with code 1.

---

### Edge Cases

- What happens when the database file at `~/.habit-tracker.db` does not exist yet? The system MUST create it automatically on first use without requiring manual setup.
- What happens when two `habit done` calls arrive for the same habit on the same calendar day? The command MUST be idempotent — only one completion record is stored, and the exit code is 0.
- What happens at midnight (day boundary)? A completion recorded at 23:59 counts for that day; a completion recorded at 00:00 counts for the next day. Streak calculation MUST use local calendar dates, not UTC.
- What happens when a habit name contains spaces? Habit names with spaces MUST be wrapped in quotes on the command line (standard shell quoting); the system MUST store and display the full name.
- What happens when the database is corrupted or unreadable? The system MUST print an error beginning with `✗` to stderr and exit with code 2 (internal error), never exposing raw SQLite error messages.
- What happens when a streak is broken (a day is missed)? The current streak resets to 0 (or 1 if done today); the longest streak retains its historical maximum.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a `habit add <name>` command that creates a uniquely named habit and confirms creation with `✓ Habit "<name>" added`.
- **FR-002**: The system MUST reject duplicate habit names with an error beginning with `✗` on stderr, exiting with code 1.
- **FR-003**: The system MUST provide a `habit done <name>` command that records the current calendar day as a completion for the named habit.
- **FR-004**: The `habit done` command MUST be idempotent: invoking it multiple times on the same calendar day MUST NOT create duplicate completion records and MUST exit with code 0.
- **FR-005**: The system MUST provide a `habit list` command that displays all habits in a table with consistent column widths, showing each habit's name and current streak in days.
- **FR-006**: The system MUST provide a `habit stats <name>` command that displays the habit's current streak, longest streak ever, and weekly completion rate (completions in the last 7 calendar days divided by 7, expressed as a percentage).
- **FR-007**: The system MUST provide a `habit delete <name>` command that permanently removes a habit and all its completion history.
- **FR-008**: Every successful mutation command MUST print a confirmation message beginning with `✓` to stdout and exit with code 0.
- **FR-009**: Every user-facing error MUST print a message beginning with `✗` to stderr. User errors (unknown habit, duplicate name, invalid input) MUST exit with code 1. Internal errors (I/O failure, database corruption) MUST exit with code 2.
- **FR-010**: Raw SQLite error messages MUST NEVER be exposed to the user.
- **FR-011**: The database MUST be stored at `~/.habit-tracker.db` and MUST be created automatically on first use.
- **FR-012**: Streak calculation MUST use local calendar dates (not UTC). A "streak" is defined as the number of consecutive calendar days ending today (or yesterday if not yet done today) on which the habit was completed.
- **FR-013**: All commands MUST complete within 200 ms on a modern developer laptop.
- **FR-014**: The tool MUST accept habit names that contain spaces when supplied via standard shell quoting.

### Non-Functional Requirements

- **NFR-001**: The implementation MUST use TypeScript with `"strict": true` enabled. No `@ts-ignore` or untyped `any` casts are permitted without an explanatory comment.
- **NFR-002**: Database access MUST use `better-sqlite3` (synchronous API). No async/await is permitted in database call paths.
- **NFR-003**: Business logic (streak calculation, statistics) MUST reside in pure functions that are independently unit-testable, separate from all database and CLI concerns.
- **NFR-004**: Unit tests MUST cover: streak calculation, idempotency of the `done` command, and date-boundary behaviour (midnight rollover). Tests MUST use Vitest.
- **NFR-005**: The CLI MUST be built with `commander`. Output colouring MAY use `chalk`.
- **NFR-006**: The tool MUST run on Node.js 22 and target macOS and Linux developer workstations. No network calls are permitted at runtime.

### Key Entities

- **Habit**: A named, user-defined activity to track. Attributes: unique name (string), creation timestamp.
- **Completion**: A record that a specific habit was completed on a specific calendar date. Attributes: habit name (foreign key), calendar date (date string). The combination of habit name and date MUST be unique (enforced at the database level).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five commands (`add`, `done`, `list`, `stats`, `delete`) are available and return correct results for the acceptance scenarios defined in this specification.
- **SC-002**: Every command completes in under 200 ms on a modern developer laptop for a database containing up to 365 completions per habit and up to 50 habits.
- **SC-003**: The `done` command is idempotent: running it twice on the same day produces exactly one completion record and exits with code 0 both times.
- **SC-004**: Streak and statistics values are accurate across day boundaries, including the rollover at midnight and streak breaks caused by missed days.
- **SC-005**: All unit tests pass (`npm test`) and TypeScript compiles without errors (`tsc --noEmit`).
- **SC-006**: No raw database error messages are ever visible to the end user; all errors follow the `✓`/`✗` convention and correct exit codes.

## Assumptions

- The target user is a developer running the tool on a personal macOS or Linux workstation; no multi-user or remote access scenarios are in scope.
- The local system clock is authoritative for determining "today"; no server-side time synchronisation is required.
- The database will contain at most a few hundred habits and a few years of daily completions per habit; no large-scale optimisation is required for v1.
- Habit names are case-sensitive (`Exercise` and `exercise` are distinct habits).
- No undo or history-editing functionality is required for v1.
- The `habit` binary is invoked directly from a terminal; no shell completion, man page, or GUI integration is in scope.

## Out of Scope

- Recurring schedules or frequency targets (e.g., "3 times per week").
- Reminders, notifications, or scheduled jobs.
- Syncing data between devices or to a remote server.
- Editing a habit's name after creation.
- Backfilling completions for past dates.
- Multi-user support or authentication.
- Web or mobile interfaces.
- Shell auto-completion scripts.
