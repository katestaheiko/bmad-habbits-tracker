# Spec-Driven Development — Core Principles

*Based on Spec Kit (github/spec-kit) and BMAD Method, with synthesis from
related structured-development literature.*

---

## 1. Specification as the Primary Artifact

In traditional development, code is the primary artifact and specs are
disposable scaffolding discarded after implementation. SDD inverts this:
**the specification is the permanent, authoritative source of truth** and the
code is its executable representation.

Consequences:
- Specs are version-controlled alongside code
- When behavior changes, the spec is updated first, code follows
- A failing test is read as "code drifted from spec", not "spec was wrong"

Spec Kit embodies this through `spec.md` — a structured document that
describes *what* the system does, not *how*. BMAD embodies it through `PRD.md`
feeding `architecture.md` feeding story files, each acting as the ground truth
for the next phase.

---

## 2. Intent Before Implementation

Developers must articulate *what* they want before deciding *how* to build it.
This separation of concerns prevents the common failure mode of
**solution-first thinking**, where architectural choices are made before
requirements are understood.

Spec Kit enforces this through a two-step workflow:
1. `/speckit.specify` — describe what to build (technology-agnostic)
2. `/speckit.plan` — choose the tech stack and implementation approach

BMAD enforces it through phase gates: planning artifacts (PRD) are completed
and validated before solutioning artifacts (architecture) are created.

**Practical effect:** the team discovers ambiguities, contradictions, and
missing requirements at the cheap specification stage rather than the expensive
implementation stage.

---

## 3. Progressive Refinement over One-Shot Generation

Producing a complete, correct specification in one pass is as unrealistic as
writing correct code in one pass. SDD treats specification as an iterative
process with defined refinement steps.

Spec Kit's refinement sequence:
```
specify → clarify → analyze → plan → tasks → implement
```

BMAD's refinement sequence:
```
brainstorm → product-brief → PRD → UX-design → architecture →
epics-and-stories → readiness-check → implement (story by story)
```

Each step adds precision. The `clarify` command in Spec Kit and the
readiness-check workflow in BMAD both serve the same purpose: surface and
resolve remaining ambiguities before expensive implementation work begins.

---

## 4. Traceability from Requirement to Code

Every line of implemented code should be traceable back to a requirement, and
every requirement should be traceable forward to at least one implemented
behaviour. This traceability is what makes specifications *executable* rather
than merely *descriptive*.

Spec Kit achieves traceability by:
- Generating `tasks.md` directly from `plan.md` which is derived from `spec.md`
- Extensions like `spec-kit-verify` and `spec-kit-verify-tasks` validate that
  tasks marked complete have real implementation behind them

BMAD achieves traceability by:
- Story files reference their parent epic, which references the PRD
- The `code-review` workflow loads both the story and the architecture to
  validate that implementation matches intent
- `sprint-status.yaml` links story completion to epic progress

---

## 5. AI Agents as First-Class Workflow Participants

SDD is not simply "write specs and then code". It treats AI agents as
participants in a structured workflow with defined roles, inputs, and outputs —
not as a general-purpose "ask anything" interface.

Spec Kit formalises this through:
- Slash commands that invoke specific phases (`/speckit.plan`, `/speckit.tasks`)
- Constitution files that govern how the AI behaves across all phases
- Extension system that adds new agent capabilities without breaking existing ones

BMAD formalises this through named agents with distinct responsibilities:
| Agent | Role |
|---|---|
| **Analyst (Mary)** | Brainstorming, research, product briefs, PRFAQ |
| **PM (John)** | PRD creation, epic and story breakdown |
| **Architect (Winston)** | Technical architecture, ADRs, readiness checks |
| **UX Designer (Sally)** | UX specification when the product has a UI |
| **Developer (Amelia)** | Sprint planning, story implementation, code review |

Using named agents with defined scopes prevents the "one LLM doing everything"
problem where context pollution causes inconsistent decisions across phases.

---

## 6. Separation of "What" and "How"

Related to principle 2 but worth stating independently: SDD requires a
**language-agnostic requirements layer** that is completely separate from
implementation decisions.

A `spec.md` should be understandable by a product manager with no coding
knowledge. An `architecture.md` can reference PostgreSQL and TypeScript because
it is the "how" layer. A `PRD.md` never mentions databases.

This separation enables:
- Switching tech stacks without rewriting requirements
- Evaluating multiple implementation approaches against the same spec
- Non-technical stakeholders reviewing and approving specifications

---

## 7. Governance Through Constitutions and Context

Both methodologies use a "governing document" concept to ensure AI agents
behave consistently throughout a project:

- **Spec Kit:** `constitution.md` — project principles, coding standards, and
  quality gates that apply to every phase
- **BMAD:** `project-context.md` — technology stack, conventions, and
  implementation rules; works like a constitution for implementation agents

Without governance documents, AI agents make locally reasonable but globally
inconsistent decisions (e.g., using different error handling patterns in
different parts of the codebase).
