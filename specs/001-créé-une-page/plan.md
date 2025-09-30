
# Implementation Plan: Créer un Prospect - Formulaire de création

**Branch**: `001-créé-une-page` | **Date**: 2025-09-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-créé-une-page/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Creating a dynamic prospect creation form page with 18 fields including searchable formation dropdown, conditional company fields, and real-time validation. The form fetches training data from an external service, validates inputs according to business rules, and submits prospect data to a processing webhook. Built with Next.js/React frontend using shadcn/ui components.

## Technical Context
**Language/Version**: TypeScript 5.x / Next.js 14.2.4 / React 18.3.1
**Primary Dependencies**: Next.js, React Hook Form, Zod validation, shadcn/ui components, Axios
**Storage**: External webhook service (no local persistence)
**Testing**: Jest + React Testing Library
**Target Platform**: Web browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: web (frontend-focused with external API integration)
**Performance Goals**: Form response <200ms, search debounce 300ms, submission <2s
**Constraints**: Must handle network failures gracefully, support form data caching for resilience
**Scale/Scope**: Single form page, ~20 fields, 2 external API integrations

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Simplicity**: Single-purpose form page with clear responsibility
✅ **Testability**: Form validation and API integration easily testable
✅ **Maintainability**: Using established patterns (React Hook Form, Zod)
✅ **No over-engineering**: Direct implementation without unnecessary abstractions

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
frontend/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── prospects/
│   │           └── create/
│   │               └── page.tsx
│   ├── components/
│   │   └── prospects/
│   │       ├── ProspectForm.tsx
│   │       ├── FormationSearch.tsx
│   │       └── FieldValidators.ts
│   ├── lib/
│   │   └── api/
│   │       ├── formations.ts
│   │       └── prospects.ts
│   └── types/
│       └── prospect.ts
└── tests/
    ├── components/
    │   └── ProspectForm.test.tsx
    └── api/
        └── prospects.test.ts
```

**Structure Decision**: Web application structure focusing on frontend with Next.js App Router. The prospect creation form will be a new page under the dashboard area with dedicated components for form handling, formation search, and API integration layers.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Type definitions from data-model.md → TypeScript interfaces [P]
- API contracts → API client functions and tests [P]
- Form schema → Zod validation schemas [P]
- Each user story → Component implementation task
- Integration tests for complete user flows

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Types → API → Components → Page
- Mark [P] for parallel execution (independent files)

**Task Categories**:
1. **Setup & Types** (Tasks 1-3): TypeScript interfaces, Zod schemas
2. **API Layer** (Tasks 4-6): API clients, error handling, caching
3. **Components** (Tasks 7-12): Form fields, search dropdown, validators
4. **Integration** (Tasks 13-15): Page assembly, routing, tests
5. **Testing** (Tasks 16-20): Unit tests, integration tests, E2E scenarios

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
