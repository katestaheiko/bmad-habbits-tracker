# Epic 04 — CLI UX & Project Infrastructure

*BMAD Method | Phase 3: Solutioning | Agent: PM (John)*
*References: PRD FR-04, NFR-01–05, architecture.md → index.ts, db.ts*

## Goal

The project is set up, buildable, and ships a polished CLI experience
with correct error handling and fast response times.

## Stories

### Story 04.1 — Project Bootstrap & Database Layer

**Implementation tasks:**
1. Initialise project: `package.json`, `tsconfig.json`, `.gitignore`
2. Install production deps: `better-sqlite3`, `commander`, `chalk`
3. Install dev deps: `typescript`, `@types/better-sqlite3`, `@types/node`, `vitest`
4. Implement `db.ts`:
   - Open `~/.habit-tracker.db` (create if not exists)
   - Run DDL for `habits` and `tracking` tables
   - Set `PRAGMA foreign_keys = ON`
   - Export typed `db` singleton
5. Add npm scripts: `build` (tsc), `test` (vitest), `typecheck` (tsc --noEmit)

---

### Story 04.2 — CLI Entry Point & Error Handling

**Implementation tasks:**
1. Create `index.ts` with shebang `#!/usr/bin/env node`
2. Set up `commander` with program name `habit` and version from package.json
3. Register all five commands: `add`, `list`, `done`, `stats`, `delete`
4. Global error handler:
   ```typescript
   try { /* command */ } catch (e) {
     err(e instanceof Error ? e.message : 'Internal error')
     process.exit(e instanceof AppError && e.code === 'DB_ERROR' ? 2 : 1)
   }
   ```
5. Verify `habit --help` shows all commands with descriptions

---

### Story 04.3 — Display Helpers & Visual Polish

**Implementation tasks:**
1. `ok(msg)`: print `chalk.green('✓') + ' ' + msg` to stdout
2. `err(msg)`: print `chalk.red('✗') + ' ' + msg` to stderr
3. Column alignment utility: compute max width per column, pad with spaces
4. `printHabitList`: header row + separator + data rows
5. `printStats`: header row + separator + data rows with `%` on rate column
6. Verify output looks correct in an 80-column terminal

---

### Story 04.4 — Build, Link & End-to-End Validation

**Implementation tasks:**
1. Add `"bin": { "habit": "dist/index.js" }` to `package.json`
2. Run `npm run build` — zero TypeScript errors
3. Run `npm link` — `habit` is available in PATH
4. Manual end-to-end smoke test:
   - `habit add "Morning run"` → confirmation
   - `habit list` → shows habit, not done, streak 0
   - `habit done "Morning run"` → confirmation
   - `habit list` → shows ✓, streak 1
   - `habit stats` → streak 1, rate 14% (1/7)
   - `habit delete "Morning run"` → confirmation
   - `habit list` → empty state message
5. Run `npm test` — all unit tests pass

## Definition of Done
- `npm run build` exits 0
- `npm test` exits 0 with all tests passing
- All five CLI commands work correctly end-to-end
- `habit --help` shows readable usage information
- Response time for all commands is measurably < 200 ms
