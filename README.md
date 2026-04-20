# Habit Tracker — SDD Methodology Comparison

A pet project built **twice** — once with **Spec Kit** and once with **BMAD Method** —
to compare Spec-Driven Development methodologies end-to-end.

## Repository Structure

```
habit-tracker-sdd/
├── README.md                        ← this file
├── docs/
│   ├── feature-definition.md        ← feature scope, inputs, outputs
│   ├── sdd-principles.md            ← 5 key SDD concepts
│   ├── comparison.md                ← Spec Kit vs BMAD across 5 criteria
│   └── unified-sdd-template.md      ← reusable SDD workflow template
├── spec-kit/
│   ├── constitution.md              ← project governing principles (Step 2)
│   ├── spec.md                      ← feature specification (Step 3)
│   ├── plan.md                      ← technical implementation plan (Step 4)
│   └── tasks.md                     ← actionable task list (Step 5)
├── bmad/
│   ├── PRD.md                       ← Product Requirements Document
│   ├── architecture.md              ← technical architecture decisions
│   ├── epics/
│   │   ├── epic-01-habit-management.md
│   │   ├── epic-02-daily-tracking.md
│   │   ├── epic-03-statistics.md
│   │   └── epic-04-cli-ux.md
│   └── sprint-status.yaml           ← sprint tracking
└── src/                             ← shared TypeScript implementation
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                 ← CLI entry point
        ├── db.ts                    ← SQLite database layer
        ├── habits.ts                ← habit CRUD operations
        ├── tracking.ts              ← daily check-in logic
        ├── stats.ts                 ← streaks & statistics
        └── display.ts               ← terminal output formatting
```

## The Feature

**Habit Tracker CLI** — a command-line tool that lets users create habits,
mark them as done daily, and track streaks over time.

```bash
# Add a habit
habit add "Read 30 minutes"

# List all habits with today's status
habit list

# Mark a habit as done today
habit done "Read 30 minutes"

# View streak statistics
habit stats

# Delete a habit
habit delete "Read 30 minutes"
```

## Methodologies

| | Spec Kit | BMAD Method |
|---|---|---|
| **Approach** | Specification-first, AI-executable specs | Agent-based, phase-driven planning |
| **Entry point** | `specify init` + slash commands | `npx bmad-method install` + agent skills |
| **Artifacts** | constitution → spec → plan → tasks | PRD → architecture → epics → stories |
| **AI integration** | Slash commands in IDE | Specialized agents per phase |
| **Strengths** | Speed, lightweight, single-feature focus | Structure, traceability, enterprise-ready |

## Key Results

See [docs/comparison.md](docs/comparison.md) for the full 5-criteria analysis.

See [docs/unified-sdd-template.md](docs/unified-sdd-template.md) for the reusable SDD workflow
combining best practices from both.

## Quick Start

```bash
cd src
npm install
npm run build
npm link           # makes `habit` available globally

habit add "Exercise 20 min"
habit list
habit done "Exercise 20 min"
habit stats
```

## References

- [Spec Kit — github/spec-kit](https://github.com/github/spec-kit)
- [BMAD Method](https://docs.bmad-method.org)
- [SDD Principles](docs/sdd-principles.md)
