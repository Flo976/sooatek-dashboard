# Research & Technical Decisions

## Form State Management

**Decision**: React Hook Form with Zod validation
**Rationale**:
- Already in dependencies (react-hook-form ^7.51.3)
- Excellent TypeScript support
- Built-in validation with Zod schema
- Minimal re-renders for performance
**Alternatives considered**:
- Formik: More boilerplate, less performant
- Native React state: Would require custom validation logic

## Component Library

**Decision**: shadcn/ui components
**Rationale**:
- Already initialized in project (components.json exists)
- Provides all needed form components
- Consistent with existing UI patterns
- Accessible by default
**Alternatives considered**:
- Material-UI: Heavier bundle size
- Custom components: Time-consuming, accessibility concerns

## API Communication

**Decision**: Axios for HTTP requests
**Rationale**:
- Already in dependencies (axios ^1.7.2)
- Better error handling than fetch
- Request/response interceptors for caching
- Built-in timeout support
**Alternatives considered**:
- Native fetch: Less features, requires wrapper
- SWR/React Query: Overkill for simple form submission

## Formation Search Implementation

**Decision**: Debounced search with local caching
**Rationale**:
- Reduces API calls with 300ms debounce
- Local cache improves UX when service unavailable
- Session storage for cache persistence
**Implementation details**:
- Use React Hook Form's watch for input monitoring
- Custom useDebounce hook for search delay
- SessionStorage for formation cache

## Form Validation Strategy

**Decision**: Client-side with Zod schema + server response handling
**Rationale**:
- Immediate feedback for user
- Reduces invalid server requests
- Zod provides type safety
**Validation rules**:
- Email: RFC 5322 standard (Zod email validator)
- Phone: International format with libphonenumber-js
- SIRET: 14-digit validation with checksum
- Dates: Native date picker with min/max constraints

## Error Handling

**Decision**: Toast notifications with form-level error display
**Rationale**:
- Sonner already in dependencies
- Non-blocking user feedback
- Accessible error announcements
**Error scenarios**:
- Network failures: Show retry option
- Validation errors: Inline field errors
- Server errors: Toast with details

## Navigation Guard

**Decision**: beforeunload event with React effect
**Rationale**:
- Native browser API
- Simple implementation
- Works with all navigation types
**Implementation**:
- Track form dirty state
- Show browser confirmation dialog
- Clean up on unmount

## Testing Strategy

**Decision**: Jest + React Testing Library for unit and integration tests
**Rationale**:
- Already configured in project
- Best practices for React testing
- Good accessibility testing support
**Test coverage**:
- Form validation rules
- API error scenarios
- User interaction flows
- Accessibility requirements

## Performance Optimizations

**Decision**: Code splitting + lazy loading for form components
**Rationale**:
- Reduce initial bundle size
- Faster page load
- Next.js dynamic imports
**Optimizations**:
- Lazy load formation search component
- Debounce search input
- Memoize expensive computations
- Virtual scrolling for long dropdown lists

## Accessibility

**Decision**: ARIA labels + keyboard navigation + screen reader support
**Rationale**:
- Legal compliance requirement
- Better UX for all users
- shadcn/ui has built-in support
**Implementation**:
- Proper label associations
- Error announcements
- Keyboard shortcuts
- Focus management