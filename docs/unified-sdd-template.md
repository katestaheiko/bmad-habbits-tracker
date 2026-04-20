# Unified SDD Workflow Template

*A reusable Spec-Driven Development template combining best practices from
Spec Kit and BMAD Method. Designed for single teams building real products.*

---

## When to Use This Template

| Project size | Team | Recommended track |
|---|---|---|
| Single feature | 1 dev | Spec Kit only (spec → plan → tasks → implement) |
| Small product (< 20 stories) | 1–3 devs | **This template** |
| Large product or enterprise | 3+ devs / roles | BMAD Method (full track) |

---

## Phase 0 — Governance (Spec Kit: constitution)

**Purpose:** Establish non-negotiable rules before any specification work.
**Time investment:** 30–60 minutes (do once per project, not per feature).
**Artifact:** `constitution.md`

Checklist:
- [ ] Define the project mission in 1–2 sentences
- [ ] Set language, runtime, and key dependency choices
- [ ] Define code quality standards (linting, formatting, strict mode)
- [ ] Define UX/output standards (error format, confirmation messages, exit codes)
- [ ] Define testing requirements (what must be unit-tested, what can be skipped)
- [ ] Define the spec compliance rule: "spec.md must be updated before code changes"

**Template stub:**
```markdown
# Project Constitution
## Mission
## Technology Stack
## Code Quality Standards
## UX Standards
## Testing Requirements
## Spec Compliance Rules
```

---

## Phase 1 — Requirements (Spec Kit: specify + BMAD: PRD)

**Purpose:** Define WHAT to build, technology-agnostic.
**Time investment:** 1–4 hours depending on complexity.
**Artifact:** `spec.md` (or `PRD.md` for larger scope)

### Step 1.1 — Feature Summary
Write 2–3 sentences describing what the feature does and for whom.
No technology, no architecture — pure user value.

### Step 1.2 — User Stories
For each distinct user need, write a story in the format:
```
As a [persona], I want to [action], so that [outcome].
```
Each story must have numbered acceptance criteria (AC-XX.YY).

### Step 1.3 — Non-Functional Requirements
Table format: ID | Category | Requirement.
Categories: Performance, Reliability, Security, Portability, Privacy.

### Step 1.4 — Scope Boundary
Explicit "Out of Scope for v1" list. This is as important as the in-scope list.

### Step 1.5 — Clarification Pass
Before proceeding, answer: "What assumptions am I making that could be wrong?"
Document the answers. (Equivalent to Spec Kit's `/speckit.clarify`.)

**Checklist before advancing to Phase 2:**
- [ ] Every user story has at least 2 acceptance criteria
- [ ] All NFRs are measurable (no "the system should be fast")
- [ ] Scope boundary is explicit
- [ ] A non-technical stakeholder could read and validate spec.md

---

## Phase 2 — Architecture (BMAD: architecture + Spec Kit: plan)

**Purpose:** Define HOW to build it. Technology-specific decisions documented
as Architecture Decision Records (ADRs).
**Time investment:** 1–3 hours.
**Artifacts:** `plan.md` (or `architecture.md` for complex systems)

### Step 2.1 — Technology Stack Table
| Concern | Choice | Rationale |

### Step 2.2 — Module Boundaries
List each module/file with its single responsibility.
Define interface contracts (function signatures, return types, error types).

### Step 2.3 — Data Model
Schema (SQL DDL or type definitions) for all persistent data.

### Step 2.4 — Error Taxonomy
| Code | Meaning | Exit code / HTTP status |
Define error codes before implementation so they are consistent.

### Step 2.5 — Architecture Decision Records
For each non-obvious decision:
```markdown
### ADR-NN: [Title]
**Context:** Why this decision was needed.
**Decision:** What was chosen.
**Consequences:** Trade-offs accepted.
```

### Step 2.6 — Readiness Check (BMAD gate)
Before proceeding, verify:
- [ ] All module interfaces are defined
- [ ] Error taxonomy is complete
- [ ] Data model satisfies all acceptance criteria from Phase 1
- [ ] No circular dependencies in the module graph

---

## Phase 3 — Task Decomposition (Spec Kit: tasks + BMAD: epics/stories)

**Purpose:** Break architecture into independently implementable units.
**Time investment:** 30–60 minutes.
**Artifact:** `tasks.md`

### Step 3.1 — Group into Epics
An epic is a logical cluster of related work. Typical epics for a CLI tool:
- Infrastructure (project setup, database layer)
- Core domain operations (CRUD)
- Business logic (calculations, algorithms)
- Presentation layer (output formatting)
- Build & distribution

### Step 3.2 — Write Tasks
For each task:
- Use a unique ID: T-NNN
- Write a one-sentence action: "Implement `addHabit(name)`: validate, insert, return"
- Note which spec acceptance criteria it satisfies

### Step 3.3 — Order by Dependency
Tasks within an epic should be ordered so each can be implemented sequentially
without blocking on an unfinished peer. Cross-epic dependencies are explicit.

### Step 3.4 — Traceability Matrix
| Task(s) | Spec/AC reference |

**Checklist before advancing to Phase 4:**
- [ ] Every acceptance criterion is covered by at least one task
- [ ] Every NFR is covered by at least one task
- [ ] Tasks are small enough to implement in < 2 hours each
- [ ] No task depends on unspecified behaviour

---

## Phase 4 — Implementation (Spec Kit: implement + BMAD: dev-story)

**Purpose:** Build. Each task becomes a commit or PR.
**Guiding rule:** If you discover the spec was wrong or incomplete, update the
spec first, then the tasks, then implement. Never silently deviate.

### Step 4.1 — Per-Task Loop
For each task (T-NNN → T-NNN+1):
1. Read the task + relevant spec sections
2. Implement the minimal code that satisfies the acceptance criteria
3. Write or update unit tests for business logic
4. Mark task `[x]` in tasks.md
5. Commit: `feat: T-NNN — implement addHabit`

### Step 4.2 — Quality Gates (at epic completion)
- [ ] All tasks in the epic are marked complete
- [ ] All unit tests pass
- [ ] The feature can be demonstrated end-to-end against every acceptance criterion
- [ ] No spec acceptance criterion is silently unimplemented

### Step 4.3 — Drift Detection
If at any point the implementation diverges from the spec:
1. Stop
2. Decide: is the spec wrong, or is the code wrong?
3. Update the spec OR revert the code
4. Document the decision in a `## Changes` section at the bottom of spec.md

---

## Phase 5 — Validation & Retrospective (BMAD: code-review + retrospective)

**Purpose:** Verify implementation matches specification; learn for next time.
**Time investment:** 30–60 minutes.

### Step 5.1 — Acceptance Criteria Walkthrough
Go through every AC in spec.md. For each:
- [ ] Demonstrated working in a live test or automated test
- [ ] Edge cases from the spec are tested

### Step 5.2 — NFR Verification
- [ ] Performance targets met (measure, don't assume)
- [ ] Idempotency verified (run twice, check no duplicates)
- [ ] Error messages match the UX standards in constitution.md

### Step 5.3 — Retrospective Questions
1. Which specification decisions saved implementation time?
2. Which specification gaps caused rework?
3. What would you write differently in the constitution?
4. Was the task granularity right (too big / too small)?

---

## Artifact Checklist

| Phase | Artifact | Required? |
|---|---|---|
| 0 — Governance | `constitution.md` | Yes (once per project) |
| 1 — Requirements | `spec.md` | Yes (every feature) |
| 2 — Architecture | `plan.md` | Yes (every feature) |
| 3 — Tasks | `tasks.md` | Yes (every feature) |
| 4 — Implementation | source code + tests | Yes |
| 5 — Validation | AC walkthrough notes | Recommended |

---

## Key Principles (from both methodologies)

1. **Spec before code** — update specification before changing behaviour
2. **Technology-agnostic requirements** — spec.md never mentions databases or frameworks
3. **Explicit error taxonomy** — define error codes before implementation
4. **Pure functions for complex logic** — isolate testable logic from I/O
5. **Idempotency by design** — write operations must be safe to repeat
6. **Traceability** — every task traces to an acceptance criterion
7. **Constitution governs all** — project-wide rules are defined once and enforced everywhere
