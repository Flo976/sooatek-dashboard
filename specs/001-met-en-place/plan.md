# Implementation Plan: Authentication and Dashboard Foundation

**Branch**: `001-met-en-place` | **Date**: 2025-09-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-met-en-place/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
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
Building a secure authentication system with email/password login that redirects to a protected dashboard. The application uses a modern web stack with separate frontend (Next.js + shadcn) and backend (Symfony 7 + API Platform) communicating via JWT-authenticated REST APIs. Implements account security features including password complexity, account lockout after 5 failed attempts, session timeout, and password reset via email.

## Technical Context
**Language/Version**: PHP 8.2+ (Symfony 7), TypeScript 5.x (Next.js 14+)
**Primary Dependencies**: Symfony 7, API Platform 3.x, Next.js 14, React 18, shadcn/ui
**Storage**: MySQL 8.0+
**Testing**: PHPUnit (backend), Jest + React Testing Library (frontend)
**Target Platform**: Linux server (production), Docker (development)
**Project Type**: web (frontend + backend separation)
**Performance Goals**: <200ms login response time, <100ms dashboard load
**Constraints**: JWT token expiry 30 minutes, session timeout 1 hour, 5 login attempts max
**Scale/Scope**: Initial MVP for 1000 concurrent users

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on SooatekApp Constitution v1.0.0:

- [x] **Frontend Component Architecture (MCP Shadcn)**: Using shadcn/ui components - COMPLIANT
- [x] **API Security - JWT Authentication**: All protected routes use JWT - COMPLIANT
- [x] **Rate Limiting Protection**: Rate limiting on auth endpoints - COMPLIANT
- [x] **Test-First Development**: TDD approach with tests before implementation - COMPLIANT
- [x] **Separation of Concerns**: Strict frontend/backend separation via REST APIs - COMPLIANT
- [x] **Security Requirements**: JWT with RS256, short-lived tokens, refresh tokens - COMPLIANT
- [x] **Rate Limiting Config**: 5 attempts/min login, proper limits - COMPLIANT
- [x] **Code Quality Standards**: ESLint/Prettier frontend, PHP-CS-Fixer/PHPStan backend - COMPLIANT

## Project Structure

### Documentation (this feature)
```
specs/001-met-en-place/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (frontend + backend detected)
backend/
├── src/
│   ├── Entity/          # Doctrine entities
│   ├── Repository/      # Doctrine repositories
│   ├── Controller/      # API controllers
│   ├── Security/        # JWT authenticators, voters
│   ├── Service/         # Business logic services
│   └── EventListener/   # Rate limiting, audit logging
├── config/
│   ├── packages/        # Symfony config
│   └── routes/          # API routes
├── migrations/          # Database migrations
└── tests/
    ├── Unit/
    ├── Integration/
    └── Functional/

frontend/
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── (auth)/     # Auth pages group
│   │   ├── dashboard/  # Protected dashboard
│   │   └── api/        # API routes (if needed)
│   ├── components/     # shadcn/ui components
│   │   ├── ui/         # Base UI components
│   │   └── features/   # Feature-specific components
│   ├── lib/            # Utilities, API client
│   └── hooks/          # Custom React hooks
├── public/             # Static assets
└── tests/
    ├── unit/
    └── e2e/
```

**Structure Decision**: Option 2 - Web application with separated frontend/backend

## Phase 0: Outline & Research

### Research Tasks Completed

1. **Symfony 7 JWT Authentication Best Practices**
   - Decision: LexikJWTAuthenticationBundle with RS256
   - Rationale: Industry standard, well-maintained, supports refresh tokens
   - Alternatives considered: Custom JWT implementation (too complex), session auth (not stateless)

2. **Next.js 14 Authentication Patterns**
   - Decision: NextAuth.js with custom JWT provider
   - Rationale: Seamless integration with Next.js, supports JWT, good DX
   - Alternatives considered: Manual implementation (reinventing wheel), Auth0 (vendor lock-in)

3. **shadcn/ui Component Integration**
   - Decision: Direct installation with customization
   - Rationale: Full control, no vendor lock-in, follows constitution
   - Alternatives considered: Pre-built themes (less flexible)

4. **MySQL with Symfony Doctrine ORM**
   - Decision: Doctrine ORM with migrations
   - Rationale: Symfony standard, excellent MySQL support, migration system
   - Alternatives considered: Raw SQL (less maintainable), MongoDB (not requested)

5. **Rate Limiting Implementation**
   - Decision: Symfony RateLimiter component
   - Rationale: Native Symfony solution, flexible configuration, Redis support
   - Alternatives considered: nginx rate limiting (less granular), custom solution (complex)

### Output: research.md

**Status**: ✅ Complete

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### Completed Design Artifacts

1. **Data Model** (`data-model.md`): ✅
   - User entity with authentication fields
   - RefreshToken for JWT refresh flow
   - PasswordResetToken for account recovery
   - AuditLog for security tracking
   - Complete state transitions and indexes

2. **API Contracts** (`contracts/openapi.yaml`): ✅
   - POST /auth/login - User authentication
   - POST /auth/refresh - Token refresh
   - POST /auth/logout - Session termination
   - POST /auth/register - User registration
   - POST /auth/password-reset - Reset request
   - POST /auth/password-reset/confirm - Reset confirmation
   - GET /dashboard - Protected dashboard access
   - GET /user/me - Current user profile

3. **Quickstart Guide** (`quickstart.md`): ✅
   - Complete setup instructions
   - Test user scenarios
   - API testing examples
   - Troubleshooting guide
   - Security checklist

4. **Agent Context** (`CLAUDE.md`): ✅
   - Updated with project technologies
   - PHP 8.2+, TypeScript 5.x
   - Symfony 7, Next.js 14, shadcn/ui
   - MySQL 8.0+ database

**Output**: data-model.md, contracts/openapi.yaml, quickstart.md, CLAUDE.md

**Status**: ✅ Complete

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load task template and design artifacts
- Generate ~35-40 tasks across 5 phases:
  1. **Setup Phase**: Project initialization, dependencies, structure
  2. **Test Phase (TDD)**: Write failing tests for all endpoints
  3. **Backend Implementation**: Entities, services, controllers, security
  4. **Frontend Implementation**: Auth pages, dashboard, API integration
  5. **Integration & Polish**: E2E tests, documentation, optimization

**Task Categories**:
- Backend setup: Symfony installation, database config, JWT setup
- Frontend setup: Next.js initialization, shadcn components
- Contract tests: One test per API endpoint (8 tests)
- Entity implementation: User, RefreshToken, etc.
- Service layer: AuthService, UserService, RateLimiter
- API controllers: AuthController, DashboardController
- Frontend components: LoginForm, RegisterForm, Dashboard
- Integration: API client, auth middleware, session handling
- Polish: Error handling, logging, performance

**Ordering Strategy**:
- Setup tasks first (can run in parallel [P])
- Tests before implementation (TDD requirement)
- Backend before frontend (API must exist)
- Models → Services → Controllers → UI
- Integration tests last

**Parallel Execution Markers**:
- Different file tasks marked with [P]
- Database migrations run sequentially
- Component installations can be parallel
- Tests for different endpoints parallel

**Estimated Output**: 35-40 numbered tasks with clear dependencies

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No violations detected - all design decisions comply with constitution*

The implementation follows all constitutional principles:
- ✅ MCP shadcn for frontend components
- ✅ JWT authentication on all protected routes
- ✅ Rate limiting on auth endpoints
- ✅ TDD approach planned
- ✅ Strict frontend/backend separation

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
- [x] All NEEDS CLARIFICATION resolved (via /clarify command)
- [x] Complexity deviations documented (none found)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*