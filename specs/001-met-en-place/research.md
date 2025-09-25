# Research: Authentication and Dashboard Foundation

## Technical Decisions

### 1. JWT Authentication Strategy

**Decision**: LexikJWTAuthenticationBundle with RS256 algorithm
**Rationale**:
- Industry standard for Symfony JWT authentication
- Supports asymmetric keys (more secure than HS256)
- Built-in refresh token support via jwt-refresh-token-bundle
- Active maintenance and large community

**Alternatives Considered**:
- Custom JWT implementation: Too complex, security risks
- Session-based auth: Not stateless, harder to scale
- OAuth2 server: Overkill for simple auth needs

**Implementation Details**:
- Access token lifetime: 30 minutes
- Refresh token lifetime: 7 days
- Token storage: httpOnly cookies for security
- Blacklist invalidated tokens in Redis

### 2. Frontend Authentication

**Decision**: NextAuth.js with custom JWT provider
**Rationale**:
- Native Next.js integration
- Supports JWT out of the box
- Client and server-side auth helpers
- Automatic token refresh handling

**Alternatives Considered**:
- Manual JWT handling: More work, error-prone
- Auth0/Clerk: Vendor lock-in, cost at scale
- Supabase Auth: Requires their backend

**Implementation Details**:
- Custom credentials provider for email/password
- JWT strategy matching backend tokens
- Secure session management
- Protected route middleware

### 3. Component Library

**Decision**: shadcn/ui with Tailwind CSS
**Rationale**:
- Constitution requirement (MCP shadcn mandatory)
- Copy-paste components (full control)
- Highly customizable with Tailwind
- Accessible by default (Radix UI primitives)

**Alternatives Considered**:
- Material-UI: Different design system
- Ant Design: Less flexible customization
- Custom components: Time-consuming

**Implementation Details**:
- Install via CLI for each component needed
- Customize theme via CSS variables
- Dark mode support built-in
- Form validation with react-hook-form + zod

### 4. Database and ORM

**Decision**: MySQL 8.0 with Doctrine ORM
**Rationale**:
- User requirement (MySQL specified)
- Doctrine is Symfony's default ORM
- Excellent migration support
- Strong typing with PHP 8.2

**Alternatives Considered**:
- PostgreSQL: Not requested
- MongoDB: Document DB not suitable for relational data
- Raw SQL queries: Harder to maintain

**Implementation Details**:
- Use InnoDB engine for transactions
- UTF8mb4 charset for full Unicode
- Migrations versioned in git
- Fixtures for development data

### 5. API Design

**Decision**: RESTful API with API Platform
**Rationale**:
- API Platform is Symfony standard
- Auto-generates OpenAPI documentation
- Built-in pagination, filtering, validation
- JWT integration out of the box

**Alternatives Considered**:
- GraphQL: Overkill for simple CRUD
- Custom REST controllers: More boilerplate
- tRPC: Requires TypeScript on backend

**Implementation Details**:
- JSON:API or HAL+JSON format
- Versioning via URL prefix (/api/v1)
- CORS configuration for frontend domain
- Rate limiting per endpoint

### 6. Rate Limiting

**Decision**: Symfony RateLimiter Component
**Rationale**:
- Native Symfony component
- Flexible configuration per route
- Multiple storage adapters (Redis recommended)
- Supports sliding window algorithm

**Alternatives Considered**:
- Nginx rate limiting: Less granular control
- Cloudflare rate limiting: External dependency
- Custom implementation: Reinventing the wheel

**Implementation Details**:
- Login: 5 attempts per minute per IP
- Register: 3 per hour per IP
- Password reset: 3 per hour per email
- API calls: 100 per minute per user

### 7. Testing Strategy

**Decision**: PHPUnit + Jest/React Testing Library
**Rationale**:
- PHPUnit is PHP standard
- Jest is React ecosystem standard
- Both support TDD workflow
- Good IDE integration

**Alternatives Considered**:
- Pest PHP: Less mature ecosystem
- Vitest: Similar to Jest, no major advantage
- Cypress only: E2E tests insufficient alone

**Implementation Details**:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows

### 8. Development Environment

**Decision**: Docker Compose
**Rationale**:
- Consistent dev environment
- Matches production closely
- Easy onboarding for new developers
- Supports all required services

**Alternatives Considered**:
- Vagrant: Heavier, slower
- Native installation: Inconsistent across developers
- Cloud IDE: Requires internet, potential latency

**Implementation Details**:
- PHP 8.2 + nginx for backend
- Node 20 for frontend dev server
- MySQL 8.0 database
- Redis for caching/sessions
- Mailcatcher for email testing

## Security Considerations

### Password Security
- Bcrypt hashing (Symfony default)
- Minimum 8 chars, mixed case, number, special char
- Password history to prevent reuse
- Secure reset via time-limited tokens

### Token Security
- RS256 signing (asymmetric keys)
- Short-lived access tokens (30 min)
- Refresh token rotation
- Token blacklisting on logout
- CSRF protection for state-changing operations

### Rate Limiting
- Per-IP and per-user limits
- Exponential backoff for repeated failures
- Account lockout after 5 failed attempts
- CAPTCHA after 3 failed attempts (future)

### Data Protection
- HTTPS only in production
- httpOnly cookies for tokens
- Content Security Policy headers
- SQL injection prevention via ORM
- XSS protection via React

## Performance Targets

### Backend
- Login endpoint: <200ms response time
- API responses: <100ms for simple queries
- Database queries: Indexed, N+1 prevention
- Redis caching for frequently accessed data

### Frontend
- Initial page load: <3s on 3G
- Dashboard render: <100ms after auth
- Code splitting for smaller bundles
- Image optimization with Next.js Image
- Static generation where possible

## Scalability Plan

### Phase 1 (MVP - 1000 users)
- Single server deployment
- MySQL primary-only
- Redis for sessions/cache
- CDN for static assets

### Phase 2 (10,000 users)
- Load balancer + 2 app servers
- MySQL primary-replica
- Redis cluster
- Queue system for emails

### Phase 3 (100,000+ users)
- Kubernetes deployment
- MySQL sharding or Aurora
- ElastiCache for Redis
- Microservices architecture consideration

## Compliance & Standards

### Code Quality
- PSR-12 for PHP code style
- ESLint + Prettier for TypeScript/React
- PHPStan level 8 for type safety
- 80% test coverage minimum

### Security Standards
- OWASP Top 10 compliance
- GDPR considerations for EU users
- SOC 2 preparation (future)
- Regular dependency updates

### Documentation
- OpenAPI spec for all endpoints
- JSDoc/PHPDoc for public methods
- README for setup instructions
- Architecture Decision Records (ADRs)