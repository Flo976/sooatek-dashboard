# Tasks: Créer un Prospect - Formulaire de création

**Input**: Design documents from `/specs/001-créé-une-page/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript/Next.js/React/shadcn/ui
   → Structure: Frontend-focused web application
2. Load design documents:
   → data-model.md: Prospect, Formation entities
   → contracts/: formations-api.yaml, prospects-api.yaml
   → research.md: React Hook Form + Zod decisions
3. Generate tasks by category:
   → Setup: TypeScript types, API clients, validation schemas
   → Tests: API contract tests, component tests
   → Core: Form components, search functionality, page
   → Integration: Error handling, navigation guards
   → Polish: Accessibility, performance optimization
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Component tests before components (TDD)
   → Types before implementation
5. Number tasks sequentially (T001, T002...)
6. Validate completeness for all entities and contracts
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `frontend/src/` for source, `frontend/tests/` for tests
- Components in `frontend/src/components/prospects/`
- API layer in `frontend/src/lib/api/`
- Types in `frontend/src/types/`

## Phase 3.1: Setup & Types
- [x] T001 [P] Create TypeScript interface definitions in frontend/src/types/prospect.ts
- [x] T002 [P] Create Formation type definitions in frontend/src/types/formation.ts
- [x] T003 [P] Create Zod validation schemas in frontend/src/lib/validation/prospect-schema.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test formations search API in frontend/tests/api/formations.test.ts
- [x] T005 [P] Contract test prospect submission API in frontend/tests/api/prospects.test.ts
- [x] T006 [P] Component test ProspectForm with validation in frontend/tests/components/ProspectForm.test.tsx
- [x] T007 [P] Component test FormationSearch dropdown in frontend/tests/components/FormationSearch.test.tsx
- [x] T008 [P] Integration test complete form flow in frontend/tests/integration/prospect-creation.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T009 [P] API client for formations search in frontend/src/lib/api/formations.ts
- [x] T010 [P] API client for prospect submission in frontend/src/lib/api/prospects.ts
- [x] T011 [P] Field validation utilities in frontend/src/components/prospects/FieldValidators.ts
- [x] T012 Formation search component with caching in frontend/src/components/prospects/FormationSearch.tsx
- [x] T013 ProspectForm main component with React Hook Form in frontend/src/components/prospects/ProspectForm.tsx
- [x] T014 Prospect creation page in frontend/src/app/dashboard/prospects/create/page.tsx

## Phase 3.4: Integration & Error Handling
- [x] T015 Add error boundary and toast notifications in ProspectForm.tsx
- [x] T016 Implement navigation guard for unsaved changes in ProspectForm.tsx
- [x] T017 Add loading states and disabled form during submission in ProspectForm.tsx
- [x] T018 Implement formation cache fallback mechanism in FormationSearch.tsx

## Phase 3.5: Polish & Accessibility
- [ ] T019 [P] Add aria-labels and screen reader support in ProspectForm.tsx
- [ ] T020 [P] Implement keyboard navigation for FormationSearch dropdown
- [ ] T021 [P] Add form auto-save to sessionStorage in ProspectForm.tsx
- [ ] T022 Performance optimization: memoize expensive form operations
- [ ] T023 [P] Unit tests for validation edge cases in frontend/tests/unit/validation.test.ts
- [ ] T024 Manual testing following quickstart.md scenarios

## Dependencies
- Types (T001-T003) before all implementation
- Tests (T004-T008) before implementation (T009-T014)
- T001 blocks T003, T006, T013
- T002 blocks T007, T012
- T009 blocks T012, T018
- T010 blocks T013, T015
- T012 blocks T013
- Core implementation (T009-T014) before integration (T015-T018)
- Integration before polish (T019-T024)

## Parallel Execution Examples

### Phase 3.1 - Setup (all parallel):
```
Task: "Create TypeScript interface definitions in frontend/src/types/prospect.ts"
Task: "Create Formation type definitions in frontend/src/types/formation.ts"
Task: "Create Zod validation schemas in frontend/src/lib/validation/prospect-schema.ts"
```

### Phase 3.2 - Tests (all parallel after T001-T003):
```
Task: "Contract test formations search API in frontend/tests/api/formations.test.ts"
Task: "Contract test prospect submission API in frontend/tests/api/prospects.test.ts"
Task: "Component test ProspectForm with validation in frontend/tests/components/ProspectForm.test.tsx"
Task: "Component test FormationSearch dropdown in frontend/tests/components/FormationSearch.test.tsx"
Task: "Integration test complete form flow in frontend/tests/integration/prospect-creation.test.tsx"
```

### Phase 3.3 - Core Implementation (some parallel):
```
# After tests fail, start with independent files:
Task: "API client for formations search in frontend/src/lib/api/formations.ts"
Task: "API client for prospect submission in frontend/src/lib/api/prospects.ts"
Task: "Field validation utilities in frontend/src/components/prospects/FieldValidators.ts"

# Then dependent components:
Task: "Formation search component with caching in frontend/src/components/prospects/FormationSearch.tsx"
Task: "ProspectForm main component with React Hook Form in frontend/src/components/prospects/ProspectForm.tsx"
Task: "Prospect creation page in frontend/src/app/dashboard/prospects/create/page.tsx"
```

## Specific Implementation Notes

### T001 - Prospect TypeScript interfaces
- Export all interfaces from data-model.md
- Include proper JSDoc comments
- Add utility types for form state

### T004-T005 - API Contract Tests
- Use MSW (Mock Service Worker) for API mocking
- Test both success and error responses
- Validate request/response schemas match OpenAPI

### T006 - ProspectForm Component Test
- Test all field validations
- Test conditional company fields logic
- Test form submission and reset behavior
- Use React Testing Library with user events

### T013 - ProspectForm Implementation
- Use React Hook Form with Zod resolver
- Implement conditional field visibility
- Handle form submission with loading states
- Clear form after successful submission

### T016 - Navigation Guard
- Use beforeunload event listener
- Show browser confirmation when form is dirty
- Clean up event listeners on unmount

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (T004-T005)
- [x] All entities have type definitions (T001-T002)
- [x] All tests come before implementation (T004-T008 before T009-T014)
- [x] Parallel tasks truly independent (marked [P])
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

## File Dependencies Map
```
Types (T001-T003) →
├── API Clients (T009-T010)
├── Components (T012-T013)
└── Tests (T004-T008)

API Clients (T009-T010) →
├── FormationSearch (T012)
├── ProspectForm (T013)
└── Error Handling (T015)

Components (T012-T013) →
├── Page (T014)
├── Integration Features (T015-T018)
└── Polish (T019-T024)
```

## Testing Strategy
- **Unit Tests**: Individual validation functions, utilities
- **Component Tests**: Form behavior, user interactions, accessibility
- **Integration Tests**: Complete user flows, API integration
- **Contract Tests**: API request/response validation
- **Manual Tests**: Cross-browser, network failure scenarios