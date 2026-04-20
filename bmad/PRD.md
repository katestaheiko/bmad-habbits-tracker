# Product Requirements Document — Habit Tracker CLI

*Created using BMAD Method, Phase 2: Planning.*
*Agent: PM (John) | Workflow: `bmad-create-prd`*

---

## Executive Summary

Users struggle to maintain consistent daily habits because they lack a simple,
frictionless way to track progress without opening a browser or mobile app.
A command-line habit tracker reduces the cost of tracking to a single terminal
command, making it accessible to developers and power users who spend most of
their day in a terminal.

---

## Problem Statement

Building new habits requires consistent repetition over weeks. Without visible
progress tracking, users underestimate how consistent (or inconsistent) they
actually are, leading to premature abandonment. Existing solutions are either
too complex (feature-rich apps requiring daily engagement) or too primitive
(text files with no structure). There is a gap for a minimal, persistent,
terminal-native habit tracker.

---

## Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Frictionless tracking | Time-to-mark-done | < 5 seconds end-to-end |
| Correct streak data | Unit test pass rate | 100% of streak scenarios |
| Reliable persistence | Data loss incidents | 0 across 1000 write ops |
| Fast response | Command latency | < 200 ms p95 |

---

## User Personas

### Primary: The Developer Habit Builder
A software developer who wants to build routines (exercise, reading, language
learning) and already has a terminal open most of the working day. Values
minimal friction and data accuracy above aesthetics.

### Secondary: The Power User
A non-developer CLI enthusiast who prefers terminal tools for productivity.
Expects correct behaviour, clear feedback, and no surprises.

---

## Functional Requirements

### FR-01: Habit Management
- FR-01.1: Users can add a named habit (name: 1–100 chars, unique, case-sensitive)
- FR-01.2: Users can view all habits ordered by creation date
- FR-01.3: Users can delete a habit and all its history permanently

### FR-02: Daily Completion Tracking
- FR-02.1: Users can mark a habit as done for the current calendar day
- FR-02.2: Marking an already-completed habit again has no effect (idempotent)
- FR-02.3: The current day is determined by the system clock at invocation time

### FR-03: Progress Statistics
- FR-03.1: Current streak: consecutive days ending today or yesterday
- FR-03.2: Longest streak: maximum run of consecutive completion days ever
- FR-03.3: 7-day completion rate: percentage of last 7 calendar days completed

### FR-04: User Interface
- FR-04.1: All interaction is via CLI subcommands (`add`, `list`, `done`, `stats`, `delete`)
- FR-04.2: Success messages prefix with `✓`; error messages prefix with `✗`
- FR-04.3: Errors are written to stderr; normal output to stdout

---

## Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | All commands < 200 ms on modern hardware |
| NFR-02 | Reliability | No data loss; SQLite ACID guarantees |
| NFR-03 | Portability | Runs on macOS, Linux, Windows (Node 20+) |
| NFR-04 | Privacy | No network access; data stays local |
| NFR-05 | Correctness | Idempotent operations; duplicate-safe writes |

---

## Constraints

- CLI only — no web or mobile interface in v1
- Single-user — no authentication or multi-tenancy
- Daily granularity only — no sub-day or custom-schedule habits
- No data export in v1

---

## Out of Scope (v1)

- Reminders or notifications
- Habit scheduling (weekdays only, etc.)
- Cloud sync
- Sharing or social features
- Data import/export

---

## Acceptance Test Scenarios

| Scenario | Expected Result |
|---|---|
| Add "Exercise" then run `list` | "Exercise" appears, status "not done", streak 0 |
| Run `done "Exercise"` twice on same day | Second run is silent; only one record stored |
| Run `stats` after 3 consecutive completions | Streak = 3, longest = 3 |
| Run `delete "Exercise"` | Habit and all tracking removed; no longer in `list` |
| Run `add ""` | Error: name cannot be empty |
