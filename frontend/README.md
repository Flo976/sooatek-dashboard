# Sooatek Frontend - Next.js Application

Frontend application built with Next.js 14, React 18, TypeScript, and shadcn/ui.

## Requirements

- Node.js 18+ (recommended: v20 LTS)
- npm or yarn

## Installation

### Option 1: Using Docker (Recommended)

```bash
# From project root
docker-compose up -d frontend
```

The application will be available at `http://localhost:3000`

### Option 2: Local Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. Start development server:
```bash
npm run dev
# or
yarn dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test

# Type checking
npm run type-check
```

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── (auth)/      # Authentication pages
│   ├── dashboard/   # Dashboard pages
│   └── api/         # API routes
├── components/      # React components
│   ├── ui/         # shadcn/ui components
│   └── features/   # Feature-specific components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
├── services/       # API service layer
└── types/          # TypeScript type definitions

public/             # Static assets
```

## Environment Variables

Create a `.env.local` file with:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Other configurations
NODE_ENV=development
```

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components.

To add a new component:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# etc.
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type checking
npm run type-check
```

## Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Prettier for code formatting

### State Management
- React hooks for local state
- Context API for global state
- React Hook Form for forms

### Styling
- Tailwind CSS for styling
- shadcn/ui for components
- CSS modules for custom styles

## API Integration

The frontend communicates with the backend API at `NEXT_PUBLIC_API_URL`.

Example service:
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

## Authentication

Using NextAuth.js for authentication with JWT strategy.

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

### Dependency issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type errors
```bash
# Check TypeScript errors
npm run type-check
```