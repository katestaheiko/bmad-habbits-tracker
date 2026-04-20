# Spec Kit vs BMAD — Methodology Comparison

*Feature under test: Habit Tracker CLI (identical requirements for both methodologies)*
*Date: April 2026*

---

## Overview

Both methodologies implement Spec-Driven Development but take fundamentally
different approaches. Spec Kit is a **lightweight, specification-first toolkit**
designed for speed and single-feature focus. BMAD is a **structured, agent-based
framework** designed for traceability across multi-phase, multi-team projects.

---

## Criterion 1: Setup Complexity

### Spec Kit
- Install: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z`
- Init: `specify init . --ai copilot`
- Time to first spec: **~5 minutes**
- Creates: `.specify/` directory with slash command prompt files

**Assessment:** Minimal setup. One install command, one init command. No
configuration files to understand before starting work.

### BMAD
- Install: `npx bmad-method install` (interactive module selector)
- Creates: `_bmad/` (agents + workflows) and `_bmad-output/` (artifacts)
- Time to first workflow: **~10–15 minutes** (understanding agents and phases)
- Requires choosing a planning track (Quick Flow / Method / Enterprise)

**Assessment:** More involved setup. The installer is guided but the user must
make upfront decisions about which planning track to use and understand the
agent model before starting.

**Winner: Spec Kit** — significantly lower time-to-first-artifact.

---

## Criterion 2: Structural Complexity

### Spec Kit
Produces 4 core artifacts in a linear sequence:
```
constitution.md → spec.md → plan.md → tasks.md
```
Each document feeds the next. The model is immediately understandable.
No agent roles to learn; all work goes through slash commands in one IDE session.

### BMAD
Produces 6–8 artifacts across 4 phases with specialised agents per phase:
```
PRD.md → architecture.md → epics/ → stories → sprint-status.yaml
```
Each phase uses a different named agent (PM, Architect, UX Designer, Developer).
Fresh chat sessions are required for each workflow to prevent context pollution.

**Assessment:** BMAD's structure is richer but requires more upfront learning.
The named-agent model is a strength at scale (it prevents any single agent from
accumulating too much context) but is overkill for a single-developer feature.

**Winner: Spec Kit** for single features; **BMAD** for multi-phase projects.

---

## Criterion 3: Flexibility

### Spec Kit
- Extension system: 40+ community extensions add new capabilities
- Preset system: customize artifact format/terminology without changing tooling
- Works with 25+ AI agents (Claude, Copilot, Cursor, Gemini, etc.)
- Constitution allows per-project rule customisation

**Assessment:** Highly flexible. The extension/preset layering system lets teams
adopt Spec Kit incrementally and customise it without forking core files.

### BMAD
- Three planning tracks: Quick Flow, Method, Enterprise
- `project-context.md` governs implementation conventions
- Module system via BMad Builder for creating entirely new workflows
- Agent roles can be customised by editing agent definition files

**Assessment:** Flexible within its phase structure, but customisation requires
deeper knowledge of the framework. The planning-track choice is made upfront
and changing it mid-project requires explicit course correction.

**Winner: Spec Kit** for casual flexibility; **BMAD** for structured enterprise customisation.

---

## Criterion 4: Scalability

### Spec Kit
- Designed around a single feature at a time (one `spec.md` per feature)
- Community extensions add multi-agent orchestration (MAQA, Conduct), Jira/ADO
  integration, parallel worktrees
- No built-in concept of "epic" or "sprint" — these require extensions

**Assessment:** Scales via extensions but the core is single-feature focused.
Large projects need community extensions or a custom workflow on top of Spec Kit.

### BMAD
- Designed for full product lifecycle from ideation to implementation
- Sprint tracking (`sprint-status.yaml`) and epic decomposition are first-class
- Three planning tracks explicitly address different project sizes
- `correct-course` workflow handles mid-sprint scope changes formally

**Assessment:** BMAD is built to scale. The phase structure, epic/story model,
and sprint tracking are designed for team-level coordination across weeks or months.

**Winner: BMAD** — built for scale from the ground up.

---

## Criterion 5: Output Quality

### Spec Kit
- `spec.md`: user-story-driven, technology-agnostic, readable by non-developers
- `plan.md`: technology-specific with clear architectural decisions
- `tasks.md`: granular, independently-implementable tasks with spec traceability
- Quality is highly dependent on prompt quality (GIGO principle applies)

**Assessment:** High quality output when the constitution is well-written.
The clarity of the constitution → spec → plan chain means downstream artifacts
have clear foundations. The `clarify` and `analyze` commands help surface gaps.

### BMAD
- `PRD.md`: formal product requirements with personas, FRs, NFRs, acceptance tests
- `architecture.md`: ADRs, interface contracts, error taxonomy — production-grade
- Epics/stories: structured with implementation tasks, acceptance criteria per story
- `check-implementation-readiness` validates cross-artifact consistency before coding

**Assessment:** Higher structural quality by default. The agent specialisation
(Architect writes architecture, PM writes PRD) reduces cross-role confusion.
The readiness-check workflow is a significant quality gate not present in Spec Kit core.

**Winner: BMAD** — more formal, more traceable, higher structural completeness.

---

## Summary Table

| Criterion | Spec Kit | BMAD | Winner |
|---|---|---|---|
| Setup time | ~5 min | ~15 min | **Spec Kit** |
| Structural complexity | Low (4 artifacts, linear) | High (8+ artifacts, 4 phases) | Context-dependent |
| Flexibility | High (extensions + presets) | Medium (tracks + modules) | **Spec Kit** |
| Scalability | Medium (extensions needed) | High (built-in) | **BMAD** |
| Output quality | Good | Excellent | **BMAD** |

---

## When to Use Which

**Use Spec Kit when:**
- Building a single feature or small product
- Team is 1–3 developers
- Speed to first working code is the priority
- AI agent integration matters (25+ agents supported)
- You want lightweight, extensible, no-overhead tooling

**Use BMAD when:**
- Building a full product or platform
- Multiple roles involved (PM, architect, developers)
- Compliance, traceability, or audit requirements exist
- Project spans multiple sprints
- Quality gates between phases are valuable

**Use both (Unified SDD) when:**
- You want Spec Kit's speed with BMAD's rigour
- See [unified-sdd-template.md](unified-sdd-template.md)
