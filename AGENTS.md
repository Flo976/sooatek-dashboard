# Repository Guidelines

## Project Structure & Module Organization
- Keep feature blueprints under `specs/<feature-id>/` (e.g., `specs/001-met-en-place/` holds spec, plan, data-model, quickstart, and API contracts). Update these before coding.
- Scaffold application code into sibling `backend/` (Symfony API Platform) and `frontend/` (Next.js + shadcn/ui) folders. Add shared helpers under `tests/` and assets in `frontend/public/` or `backend/assets/` when those services land.
- `old/` stores archived material; change only with agreement. Generated directories such as `node_modules/` should stay untracked.

## Build, Test, and Development Commands
- Boot the stack with `docker-compose up -d`, check status via `docker-compose ps`, and tear down with `docker-compose down`.
- Install dependencies in place: `docker-compose exec backend composer install` for Symfony and `cd frontend && npm install` for Next.js.
- Run dev servers in split terminals: `docker-compose exec backend symfony serve -d` (or the PHP-FPM entrypoint) and `cd frontend && npm run dev`. Use `specs/001-met-en-place/quickstart.md` for full onboarding.

## Coding Style & Naming Conventions
- PHP follows PSR-12 (4-space indentation, PascalCase classes, snake_case env keys). Group services under `backend/src/<Domain>/` to reflect bounded contexts.
- TypeScript/React observes ESLint + Prettier defaults (2-space indentation, PascalCase components, camelCase hooks). Keep shadcn components in `frontend/components/ui/` with co-located tests.
- Configuration stays in `.env`, `.env.local`, or `.env.test`; never commit credentials or generated keys.

## Testing Guidelines
- Back-end tests belong in `backend/tests/` mirroring namespaces. Execute suites with `docker-compose exec backend php bin/phpunit`; use `vendor/bin/php-cs-fixer fix --dry-run` and `vendor/bin/phpstan analyse` for quality gates.
- Front-end tests live in `frontend/__tests__/` or alongside components. Run `cd frontend && npm test`, `npm run lint`, and `npm run type-check` before every push.
- Prioritise coverage for authentication, rate limiting, and dashboard access from `specs/001-met-en-place/quickstart.md`. Note any intentional gaps in the PR.

## Commit & Pull Request Guidelines
- Git history currently shows a single `Initial commit`; keep using short, imperative summaries (e.g., `Add JWT login flow`). Use `type(scope): summary` when touching multiple areas.
- Reference the relevant spec or task in every PR, list config or data migrations, and attach UI screenshots. Confirm the commands above succeed before requesting review.

## Documentation & Specs
- Treat `specs/` as the source of truth: update `spec.md`, `plan.md`, and `tasks.md` before or alongside implementation, and record deviations there.
- When adding tooling or configuration, append concise notes to `specs/001-met-en-place/quickstart.md` so future contributors can reproduce the environment.
