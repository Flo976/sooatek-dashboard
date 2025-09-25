# Tasks: Authentication and Dashboard Foundation

**Input**: Design documents from `/specs/001-met-en-place/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app structure**: `backend/`, `frontend/` at repository root
- Backend: Symfony 7 with API Platform
- Frontend: Next.js 14 with shadcn/ui
- Database: MySQL 8.0+

## Phase 3.1: Environment Setup
- [ ] T001 Create Docker Compose configuration with MySQL, Redis, PHP 8.2, Node 20 services in docker-compose.yml
- [ ] T002 [P] Create backend/.env.example with database, JWT, and rate limiting configuration variables
- [ ] T003 [P] Create frontend/.env.example with API URL and NextAuth configuration variables
- [ ] T004 Generate RSA key pair for JWT authentication in backend/config/jwt/

## Phase 3.2: Backend Project Initialization
- [ ] T005 Initialize Symfony 7 project with API Platform in backend/ directory
- [ ] T006 Install backend dependencies: lexik/jwt-authentication-bundle, gesdinet/jwt-refresh-token-bundle, symfony/rate-limiter
- [ ] T007 [P] Configure Doctrine ORM for MySQL in backend/config/packages/doctrine.yaml
- [ ] T008 [P] Configure JWT authentication in backend/config/packages/lexik_jwt_authentication.yaml
- [ ] T009 [P] Configure rate limiter in backend/config/packages/rate_limiter.yaml
- [ ] T010 [P] Set up PHP-CS-Fixer and PHPStan level 8 in backend/

## Phase 3.3: Frontend Project Initialization
- [ ] T011 Create Next.js 14 app with TypeScript in frontend/ directory using app router
- [ ] T012 Install frontend dependencies: next-auth, axios, react-hook-form, zod
- [ ] T013 [P] Initialize shadcn/ui and install components: Button, Form, Input, Card, Alert and use MCP shadcn to do it
- [ ] T014 [P] Configure ESLint and Prettier for TypeScript/React in frontend/
- [ ] T015 [P] Set up Tailwind CSS with shadcn/ui theme configuration in frontend/tailwind.config.ts

## Phase 3.4: Database Schema (Doctrine Entities)
- [ ] T016 [P] Create User entity in backend/src/Entity/User.php with authentication fields
- [ ] T017 [P] Create RefreshToken entity in backend/src/Entity/RefreshToken.php for token management
- [ ] T018 [P] Create PasswordResetToken entity in backend/src/Entity/PasswordResetToken.php
- [ ] T019 [P] Create AuditLog entity in backend/src/Entity/AuditLog.php for security tracking
- [ ] T020 Generate and run database migrations in backend/migrations/

## Phase 3.5: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.6
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Backend API Contract Tests
- [ ] T021 [P] Write contract test for POST /api/v1/auth/login in backend/tests/Functional/Auth/LoginTest.php
- [ ] T022 [P] Write contract test for POST /api/v1/auth/refresh in backend/tests/Functional/Auth/RefreshTest.php
- [ ] T023 [P] Write contract test for POST /api/v1/auth/logout in backend/tests/Functional/Auth/LogoutTest.php
- [ ] T024 [P] Write contract test for POST /api/v1/auth/register in backend/tests/Functional/Auth/RegisterTest.php
- [ ] T025 [P] Write contract test for POST /api/v1/auth/password-reset in backend/tests/Functional/Auth/PasswordResetRequestTest.php
- [ ] T026 [P] Write contract test for POST /api/v1/auth/password-reset/confirm in backend/tests/Functional/Auth/PasswordResetConfirmTest.php
- [ ] T027 [P] Write contract test for GET /api/v1/dashboard in backend/tests/Functional/DashboardTest.php
- [ ] T028 [P] Write contract test for GET /api/v1/user/me in backend/tests/Functional/User/MeTest.php

### Frontend Component Tests
- [ ] T029 [P] Write test for LoginForm component in frontend/src/components/__tests__/LoginForm.test.tsx
- [ ] T030 [P] Write test for RegisterForm component in frontend/src/components/__tests__/RegisterForm.test.tsx
- [ ] T031 [P] Write test for Dashboard component in frontend/src/components/__tests__/Dashboard.test.tsx

## Phase 3.6: Backend Core Implementation (ONLY after tests are failing)

### Services Layer
- [ ] T032 Create UserService for user management in backend/src/Service/UserService.php
- [ ] T033 Create AuthenticationService for login/logout in backend/src/Service/AuthenticationService.php
- [ ] T034 Create TokenService for JWT generation in backend/src/Service/TokenService.php
- [ ] T035 Create PasswordResetService in backend/src/Service/PasswordResetService.php
- [ ] T036 Create AuditLogService for security events in backend/src/Service/AuditLogService.php

### Security Layer
- [ ] T037 Create JWTAuthenticator in backend/src/Security/JWTAuthenticator.php
- [ ] T038 Create LoginRateLimiter listener in backend/src/EventListener/LoginRateLimiter.php
- [ ] T039 Create AccountLockoutHandler in backend/src/Security/AccountLockoutHandler.php
- [ ] T040 Create RefreshTokenManager in backend/src/Security/RefreshTokenManager.php

### API Controllers
- [ ] T041 Implement AuthController with login/refresh/logout in backend/src/Controller/AuthController.php
- [ ] T042 Implement RegisterController in backend/src/Controller/RegisterController.php
- [ ] T043 Implement PasswordResetController in backend/src/Controller/PasswordResetController.php
- [ ] T044 Implement DashboardController in backend/src/Controller/DashboardController.php
- [ ] T045 Implement UserController with /me endpoint in backend/src/Controller/UserController.php

### Repositories
- [ ] T046 [P] Create UserRepository with custom queries in backend/src/Repository/UserRepository.php
- [ ] T047 [P] Create RefreshTokenRepository in backend/src/Repository/RefreshTokenRepository.php
- [ ] T048 [P] Create PasswordResetTokenRepository in backend/src/Repository/PasswordResetTokenRepository.php

## Phase 3.7: Frontend Implementation

### API Client
- [ ] T049 Create API client with axios interceptors in frontend/src/lib/api-client.ts
- [ ] T050 Create auth service for token management in frontend/src/services/auth.service.ts

### NextAuth Configuration
- [ ] T051 Configure NextAuth with JWT strategy in frontend/src/app/api/auth/[...nextauth]/route.ts
- [ ] T052 Create auth middleware for protected routes in frontend/src/middleware.ts

### Components (shadcn/ui based)
- [ ] T053 Create LoginForm component with validation in frontend/src/components/features/LoginForm.tsx
- [ ] T054 Create RegisterForm component in frontend/src/components/features/RegisterForm.tsx
- [ ] T055 Create PasswordResetForm in frontend/src/components/features/PasswordResetForm.tsx
- [ ] T056 Create Dashboard layout component in frontend/src/components/features/Dashboard.tsx
- [ ] T057 Create UserMenu component with logout in frontend/src/components/features/UserMenu.tsx

### Pages
- [ ] T058 Create login page in frontend/src/app/(auth)/login/page.tsx
- [ ] T059 Create register page in frontend/src/app/(auth)/register/page.tsx
- [ ] T060 Create password reset page in frontend/src/app/(auth)/password-reset/page.tsx
- [ ] T061 Create protected dashboard page in frontend/src/app/dashboard/page.tsx
- [ ] T062 Create root layout with auth provider in frontend/src/app/layout.tsx

## Phase 3.8: Integration & Middleware
- [ ] T063 Configure CORS for frontend domain in backend/config/packages/nelmio_cors.yaml
- [ ] T064 Set up email service for password reset in backend/config/packages/mailer.yaml
- [ ] T065 Create database fixtures for testing in backend/src/DataFixtures/UserFixtures.php
- [ ] T066 Implement session refresh logic in frontend auth service
- [ ] T067 Add request/response logging middleware in backend

## Phase 3.9: Polish & Documentation
- [ ] T068 [P] Write unit tests for UserService in backend/tests/Unit/Service/UserServiceTest.php
- [ ] T069 [P] Write unit tests for TokenService in backend/tests/Unit/Service/TokenServiceTest.php
- [ ] T070 [P] Write E2E test for complete auth flow in frontend/tests/e2e/auth.spec.ts
- [ ] T071 [P] Create API documentation with Swagger UI in backend
- [ ] T072 [P] Add performance monitoring for login endpoint
- [ ] T073 Update README.md with setup and deployment instructions
- [ ] T074 Create docker-compose.prod.yml for production deployment
- [ ] T075 Run security audit and fix vulnerabilities

## Dependencies
- T005 must complete before T006-T010
- T011 must complete before T012-T015
- T016-T019 must complete before T020
- T020 must complete before T021-T028
- T021-T031 must complete before T032-T062 (TDD requirement)
- T032-T040 must complete before T041-T045
- T049-T052 must complete before T053-T062
- All implementation must complete before T068-T075

## Parallel Execution Examples

### Initial Setup (T001-T015)
```bash
# Launch parallel setup tasks
Task: "Create backend/.env.example with configuration variables"
Task: "Create frontend/.env.example with configuration variables"
Task: "Configure Doctrine ORM for MySQL"
Task: "Configure JWT authentication"
Task: "Configure rate limiter"
Task: "Set up PHP-CS-Fixer and PHPStan"
Task: "Initialize shadcn/ui and install components"
Task: "Configure ESLint and Prettier"
Task: "Set up Tailwind CSS configuration"
```

### Entity Creation (T016-T019)
```bash
# Create all entities in parallel
Task: "Create User entity with authentication fields"
Task: "Create RefreshToken entity for token management"
Task: "Create PasswordResetToken entity"
Task: "Create AuditLog entity for security tracking"
```

### Contract Tests (T021-T031)
```bash
# Write all test files in parallel (different files)
Task: "Write contract test for POST /api/v1/auth/login"
Task: "Write contract test for POST /api/v1/auth/refresh"
Task: "Write contract test for POST /api/v1/auth/logout"
Task: "Write contract test for POST /api/v1/auth/register"
Task: "Write contract test for POST /api/v1/auth/password-reset"
Task: "Write contract test for POST /api/v1/auth/password-reset/confirm"
Task: "Write contract test for GET /api/v1/dashboard"
Task: "Write contract test for GET /api/v1/user/me"
Task: "Write test for LoginForm component"
Task: "Write test for RegisterForm component"
Task: "Write test for Dashboard component"
```

### Repository Implementation (T046-T048)
```bash
# Create repositories in parallel
Task: "Create UserRepository with custom queries"
Task: "Create RefreshTokenRepository"
Task: "Create PasswordResetTokenRepository"
```

### Final Polish (T068-T072)
```bash
# Polish tasks in parallel
Task: "Write unit tests for UserService"
Task: "Write unit tests for TokenService"
Task: "Write E2E test for complete auth flow"
Task: "Create API documentation with Swagger UI"
Task: "Add performance monitoring for login endpoint"
```

## Notes
- [P] tasks = different files, no dependencies, can run concurrently
- Verify all tests fail before implementing (TDD requirement)
- Commit after each completed task for granular history
- Follow constitution: shadcn/ui for frontend, JWT for auth, rate limiting required
- Estimated completion: 75 tasks, approximately 3-4 days with parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (8 endpoints → 8 test files)
- [x] All entities have model tasks (4 entities → 4 model files)
- [x] All tests come before implementation (Phase 3.5 before 3.6-3.7)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Constitution compliance verified (JWT, shadcn, rate limiting, TDD)