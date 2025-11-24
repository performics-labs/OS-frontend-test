# OneSuite Frontend Architecture

## Overview

This document defines the folder structure and architectural patterns for the OneSuite frontend application. This structure ensures maintainability, scalability, and clear separation of concerns as OneSuite grows.

## Root Structure

```
onesuite-frontend/
├── docs/                    # Project documentation
├── public/                  # Static assets served directly
├── src/                     # Application source code
├── tests/                   # Test suites and configurations
├── scripts/                 # Build and deployment scripts
└── [config files]          # TypeScript, ESLint, Vite configurations
```

## Source Code Architecture (`src/`)

```
src/
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components (Button, Input, Modal)
│   ├── forms/               # Form-specific components
│   ├── features/            # Business logic components
│   └── index.ts             # Component exports
│
├── layouts/                 # Page layout templates
│   ├── AppLayout.tsx        # Main application layout
│   ├── AuthLayout.tsx       # Authentication pages layout
│   ├── PublicLayout.tsx     # Public/marketing layout
│   └── index.ts             # Layout exports
│
├── pages/                   # Route-based page components
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Dashboard pages
│   ├── settings/            # Settings pages
│   └── index.ts             # Page exports
│
├── services/                # External API and service integrations
│   ├── api/                 # API client and endpoint definitions
│   ├── auth/                # Authentication service layer
│   ├── storage/             # Browser storage utilities
│   └── index.ts             # Service exports
│
├── contexts/                # React contexts for global state
│   ├── AuthContext.tsx      # User authentication state
│   ├── ThemeContext.tsx     # UI theme and preferences
│   └── index.ts             # Context exports
│
├── hooks/                   # Custom React hooks
│   ├── api/                 # Data fetching hooks
│   ├── auth/                # Authentication hooks
│   └── index.ts             # Hook exports
│
├── stores/                  # State management (Zustand/Redux)
│   └── index.ts             # Store configurations
│
├── utils/                   # Pure utility functions
│   ├── formatters/          # Data formatting utilities
│   ├── validators/          # Input validation functions
│   └── index.ts             # Utility exports
│
├── schemas/                 # Zod schemas for validation
│   ├── projects.schema.ts   # Project API schemas
│   ├── user.schema.ts       # User API schemas
│   └── index.ts             # Schema exports
│
├── types/                   # TypeScript type definitions
│   ├── api.ts               # API response and request types (re-exported from schemas)
│   ├── user.ts              # User-related types (re-exported from schemas)
│   ├── projects.ts          # Project types (re-exported from schemas)
│   └── index.ts             # Type exports
│
├── constants/               # Application constants and configurations
│   ├── api.ts               # API endpoints and status codes
│   ├── routes.ts            # Application route constants
│   ├── ui.ts                # UI constants (colors, breakpoints)
│   └── index.ts             # Constant exports
│
├── config/                  # Environment and app configuration
│   ├── env.ts               # Environment variable handling
│   ├── app.ts               # Application-wide settings
│   └── index.ts             # Configuration exports
│
├── assets/                  # Static media files
│   ├── icons/               # SVG icons and icon fonts
│   ├── images/              # Images and graphics
│   └── fonts/               # Custom font files
│
├── lib/                     # Third-party library configurations
│   └── index.ts             # Library setup and exports
│
├── App.tsx                  # Root application component
├── main.tsx                 # Application entry point
└── vite-env.d.ts           # Vite environment types
```

## Testing Architecture (`tests/`)

```
tests/
├── __setup__/               # Test environment configuration
├── __mocks__/               # Module mocks and stubs
├── fixtures/                # Test data and mock responses
├── unit/                    # Unit test suites
│   ├── components/          # Component unit tests
│   ├── hooks/               # Custom hook tests
│   ├── utils/               # Utility function tests
│   └── services/            # Service layer tests
├── integration/             # Integration test suites
└── e2e/                     # End-to-end test scenarios
```

## Component Organization Strategy

### UI Components (`components/ui/`)

Foundation components with no business logic:

- `Button.tsx`, `Input.tsx`, `Modal.tsx`, `Card.tsx`
- `LoadingSpinner.tsx`, `Tooltip.tsx`, `Badge.tsx`
- Form primitives and layout components

### Form Components (`components/forms/`)

Specialized form implementations:

- `LoginForm.tsx`, `UserRegistrationForm.tsx`
- `ProfileSettingsForm.tsx`, `PasswordResetForm.tsx`
- Form validation and multi-step form components

### Feature Components (`components/features/`)

Business-specific compound components:

- `UserDashboard.tsx`, `AnalyticsWidget.tsx`
- `NotificationCenter.tsx`, `ActivityFeed.tsx`
- Domain-specific component compositions

## Layout System

**AppLayout** - Primary authenticated application shell (Header + Navigation + Content + Footer)

**AuthLayout** - Authentication flow container (Logo + Form)

**PublicLayout** - Public/marketing pages

See `src/layouts/` for implementation details.

## Service Layer Architecture

### API Services (`services/api/`)

- `client.ts` - HTTP client configuration
- `endpoints.ts` - API endpoint definitions
- `userService.ts` - User management operations
- `authService.ts` - Authentication operations

### Storage Services (`services/storage/`)

- `localStorage.ts` - Local storage abstractions
- `sessionStorage.ts` - Session storage utilities
- `tokenStorage.ts` - Authentication token management

## Validation and Type Safety Strategy

### Schemas (`schemas/`)

Zod schemas as single source of truth for data validation:

- API request/response schemas with validation rules
- Runtime type checking at API boundaries
- Complex validation logic (conditional fields, custom rules)
- Schema composition and reuse

**Example:**

```typescript
// schemas/projects.schema.ts
export const ProjectSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(255),
    owner_user_id: z.string(),
    // ... all fields with validation
});
```

### Types (`types/`)

TypeScript types inferred from Zod schemas:

- Re-export types from schemas for consumer code
- Maintain backward compatibility when refactoring
- Keep types in sync with validation logic

**Example:**

```typescript
// types/projects.ts
import { ProjectSchema } from '@/schemas/projects.schema';

export type Project = z.infer<typeof ProjectSchema>;
```

## State Management Strategy

### Global State (`contexts/`)

React contexts for application-wide state:

- User authentication status
- UI theme and preferences
- Feature flag states
- Notification system state

### Local State (`stores/`)

Component-specific state management using Zustand or Redux Toolkit for:

- Form state management
- Complex component interactions
- Temporary UI state

## File Naming Conventions

### Components

- React components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Component tests: `PascalCase.test.tsx`

### Functions and Utilities

- Custom hooks: `camelCase.ts` starting with 'use' (e.g., `useAuth.ts`)
- Utility functions: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Service modules: `camelCase.ts` (e.g., `userService.ts`)

### Types and Constants

- Schema definitions: `camelCase.schema.ts` (e.g., `projects.schema.ts`)
- Type definitions: `camelCase.ts` (e.g., `projects.ts`)
- Constants: `SCREAMING_SNAKE_CASE` within files
- Configuration: `camelCase.ts` (e.g., `apiConfig.ts`)

## Import/Export Strategy

**Barrel Exports** - Each folder has an `index.ts` re-exporting public modules

**Import Patterns** - Use absolute imports with path aliases (`@/components`, `@/hooks`, `@/constants`)

## Architecture Benefits

**Maintainability**: Clear separation of concerns with predictable file locations
**Scalability**: Structure supports OneSuite's growth without major refactoring
**Developer Experience**: Consistent patterns reduce cognitive load
**Testing**: Comprehensive testing strategy with proper isolation
**Code Reuse**: Well-organized shared components and utilities

---

_OneSuite Frontend Architecture v1.0_
