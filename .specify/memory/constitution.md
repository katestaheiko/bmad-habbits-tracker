<!-- SYNC IMPACT REPORT
Version change: (new) → 1.0.0
Added sections: Technology Constraints, Development Workflow
Principles defined: Code Quality Standards, UX Standards, Architecture Principles, Specification Compliance, Testing Requirements
Templates requiring updates: ✅ constitution filled
Deferred TODOs: none
-->

# Habit Tracker CLI Constitution

## Core Principles

### I. Code Quality Standards

TypeScript strict mode (`"strict": true`) MUST be enforced at all times.
The runtime is Node.js 20 LTS; the database layer MUST use `better-sqlite3`
(synchronous — no async/await complexity in DB calls). Tests are REQUIRED for
all business logic (streak calculation, date logic). User-facing errors MUST go
to stderr with a clear, human-readable message; raw SQLite errors MUST never be
exposed to the user. Exit codes: 0 = success, 1 = user error, 2 = internal error.

### II. UX Standards

Every successful mutation MUST print a confirmation message beginning with `✓`.
Every error message MUST begin with `✗`. All tabular output MUST use consistent
column widths. No interactive prompts — all input MUST be supplied via command
arguments. Commands MUST complete in < 200 ms on a modern developer laptop.

### III. Architecture Principles

Database schema changes REQUIRE a migration; silent drops are forbidden.
Business logic (streak calculation, statistics) MUST live in pure functions,
separate from database access code. No global mutable state is permitted
outside the SQLite connection object.

### IV. Specification Compliance

All implemented behaviour MUST trace to a task in `spec-kit/tasks.md`.
Any change to observable behaviour MUST update `spec-kit/spec.md` BEFORE
the code changes. `spec-kit/spec.md` is the authoritative definition of
correct behaviour and supersedes all other sources.

### V. Testing Requirements

Unit tests are REQUIRED for: streak calculation, idempotency of the `done`
command, and date-boundary behaviour (midnight rollover). Integration tests
are not required for v1 but the architecture MUST NOT prevent them from
being added in future iterations.

## Technology Constraints

- **Language**: TypeScript 5.x, strict mode
- **Runtime**: Node.js 20 LTS
- **Database**: SQLite via `better-sqlite3` (synchronous API only)
- **Test framework**: Vitest (co-located unit tests under `src/tests/`)
- **Package manager**: npm
- **Target platform**: macOS / Linux developer workstation
- **No external network calls** permitted at runtime

## Development Workflow

1. Update `spec-kit/spec.md` to reflect the change before writing any code.
2. Add or update the corresponding task in `spec-kit/tasks.md`.
3. Write (or update) the failing test first.
4. Implement the minimal code that makes the test pass.
5. Verify `npm test` passes and exit codes match the spec.
6. Commit with a message that references the task identifier.

All PRs MUST pass TypeScript compilation (`tsc --noEmit`) and the full test
suite before merge. No `@ts-ignore` or `any` casts without an explanatory comment.

## Governance

This constitution supersedes all other practices and documentation for the
Habit Tracker CLI project. Amendments MUST follow this procedure:

1. Propose the change with written rationale.
2. Update `spec-kit/spec.md` to reflect any behavioural impact.
3. Increment the constitution version per semantic versioning:
   - **MAJOR**: removal or redefinition of a principle.
   - **MINOR**: new principle or section added.
   - **PATCH**: clarification or wording fix.
4. Update `LAST_AMENDED_DATE` to the amendment date.

The `spec-kit/spec.md` file is the runtime development reference; consult it
for authoritative behaviour definitions during implementation.

**Version**: 1.0.0 | **Ratified**: 2026-04-30 | **Last Amended**: 2026-04-30
