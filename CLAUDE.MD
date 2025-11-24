# Claude Code Guidelines

## Project Context

**OneSuite** - React 19 + TypeScript + Vite frontend application using TailwindCSS v4 for styling.

**Tech Stack:**

- React 19.1 with TypeScript 5.8
- TailwindCSS v4 (via @tailwindcss/vite)
- Vite 7 build tool
- Vitest for testing
- MSW for API mocking
- Axios for HTTP requests

**Key Commands:**

- `npm run dev` - Start dev server (Port defined in .env file, defaults to 5000)
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run lint` - ESLint check
- `npm run format` - Prettier check

## Code Style & Preferences

### Styling

- **Use TailwindCSS v4 exclusively** - No inline styles, no CSS/SCSS files
- **Colors defined in `src/index.css`** - Tailwind v4 uses `@theme` directive for color definitions (not tailwind.config.ts)
- Prefer Tailwind utility classes over custom CSS
- **Follow color palette** - Use defined color scales from `docs/color-palette.md` (aligned with Performics brand)
- Use semantic color names: `bg-disrupt-500`, `text-warm-black-500`, `border-light-grey-500`
- Avoid arbitrary color values - use the defined palette for brand consistency
- **Support both light and dark modes** - Design with theme switching in mind; use semantic tokens when appropriate, direct color utilities when brand consistency is needed

### Component Libraries

- **Shadcn/ui preferred** - Use shadcn/ui components for common UI patterns
- Components should be copied into `src/components/ui/` and customized as needed
- Shadcn components use Radix UI primitives (accessible by default)
- Adapt shadcn styling to match our color palette and design system

### Code Quality

- **Keep it simple** - Avoid over-engineering and complex abstractions
- **Minimal comments** - Only comment non-obvious business logic or complex sections
- **No obvious comments** - Code should be self-documenting through clear naming
- **DRY principle** - Extract repeated patterns into reusable utilities/components
- **No emojis in code** - Keep code, comments, and commit messages professional. Emojis acceptable in markdown documentation for visual clarity.
- **Concise communication** - Keep docs, comments, and explanations brief and direct

### TypeScript

- Strict typing - leverage TypeScript fully
- **Define Zod schemas in `src/schemas/`** - Single source of truth for types and validation
- **Export types from `src/types/`** - Re-export types inferred from Zod schemas
- **Prefer `type` over `interface`** - Use `type` by default for better flexibility and consistency
- Only use `interface` when declaration merging or class extension is needed

### Validation

- **Use Zod for all API contracts** - Validate API responses and requests at runtime
- Define schemas in `src/schemas/` with validation rules
- Infer TypeScript types from schemas using `z.infer<typeof Schema>`
- Validate data at API boundaries (services layer)

### React Patterns

- Functional components with hooks
- Extract custom hooks to `src/hooks/`
- Keep components focused and single-purpose

### Accessibility

- **Follow WCAG 2.1 AA standards** as minimum
- **Use semantic HTML** - Correct elements for their purpose (button, nav, main, article, etc.)
- **Keyboard navigation** - All interactive elements must be keyboard accessible
- **Focus management** - Visible focus states, logical tab order, focus trapping in modals
- **ARIA attributes** - Use when semantic HTML isn't sufficient (aria-label, aria-describedby, etc.)
- **Color contrast** - Minimum 4.5:1 for text, 3:1 for UI components (our palette meets this)
- **Screen reader testing** - Test with screen readers when building complex interactions
- **Alt text** - All images need descriptive alt text (empty alt="" for decorative images)
- Shadcn/ui components are accessible by default (built on Radix UI)

### Project Structure

```
src/
├── components/   # Reusable UI components
├── config/       # App configuration
├── constants/    # Constants and enums
├── hooks/        # Custom React hooks
├── layouts/      # Layout components
├── mocks/        # MSW mock handlers
├── pages/        # Page components
├── schemas/      # Zod schemas for validation
├── services/     # API clients and services
├── stores/       # State management
├── types/        # TypeScript types (re-exported from schemas)
└── utils/        # Utility functions
```

### Import Aliases

Use path aliases from `vite.config.ts`:

- `@/` - src root
- `@/components` - components directory
- `@/contexts` - contexts directory
- `@/hooks` - hooks directory
- `@/lib` - lib directory
- `@/mocks` - mocks directory
- `@/pages` - pages directory
- `@/schemas` - Zod schemas directory
- `@/types` - types directory
- `@/utils` - utils directory

### Testing

**Testing Strategy:**
- **Unit tests** for components, hooks, and utilities (Vitest + Testing Library)
- **E2E tests** for critical user flows (Playwright)
- Centralized test structure in `tests/` directory

**Test Types:**
- `tests/unit/` - Component and function unit tests
- `tests/e2e/` - End-to-end Playwright tests
  - `tests/e2e/auth/` - Authentication flows (real backend)
  - `tests/e2e/chat/` - Chat interactions (real backend)
  - `tests/e2e/smoke/` - Quick UI validation tests
- `tests/page-objects/` - Playwright Page Object Models
- `tests/fixtures/` - Playwright test fixtures

**Unit Testing (Vitest):**
- Use Vitest + Testing Library for component/unit tests
- Mirror source structure: `tests/unit/ComponentName.test.tsx` mirrors `src/ComponentName.tsx`
- Naming: `*.test.tsx` or `*.test.ts`
- Commands:
  - `npm test` - Run all unit tests
  - `npm run test:watch` - Watch mode
  - `npm run test:coverage` - Generate coverage report

**E2E Testing (Playwright):**
- Tests critical user paths with real browser automation
- Uses Page Object Model pattern for maintainability
- Hybrid approach: real backend for integration, isolated for smoke tests
- Follows 2025 best practices: role-based locators, auto-waiting, test isolation
- Commands:
  - `npm run test:e2e` - Run all E2E tests
  - `npm run test:e2e:ui` - Open Playwright UI mode
  - `npm run test:e2e:headed` - Run with visible browser
  - `npm run test:e2e:debug` - Debug mode
  - `npm run test:e2e:report` - View test report

**Running E2E Tests:**

Prerequisites:
1. Backend must be running at `http://localhost:8000`
2. Test user must exist in database:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Can be created via backend API or database seed script
3. Frontend dev server will auto-start if not running
4. Database must have proper schema (User table with name, email, password, etc.)

Run tests:
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Run in UI mode for development
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Generate test report
npm run test:e2e:report
```

**Test Coverage:**
- `tests/e2e/auth/login.spec.ts` - Login/signup flows, error handling, protected routes, session persistence (11 tests)
- `tests/e2e/chat/message-flow.spec.ts` - Chat interactions, streaming, keyboard shortcuts, error handling (14 tests)
- `tests/e2e/smoke/app-loads.spec.ts` - App loading, form elements, accessibility, responsive design, theme support (12 tests)
- Page objects in `tests/page-objects/` (base.page.ts, auth.page.ts, chat.page.ts)
- Custom fixtures in `tests/fixtures/auth.fixture.ts` with sessionStorage support

**Current Test Results:**
- 45/49 tests passing (92%)
- All auth and smoke tests passing
- Most chat tests passing (4 fail due to slow backend response times)

**Adding New E2E Tests:**

1. Create Page Object Model in `tests/page-objects/` if needed
2. Use existing fixtures from `tests/fixtures/auth.fixture.ts`
3. Write test in appropriate directory (`auth/`, `chat/`, `smoke/`)
4. Follow naming: `*.spec.ts`
5. Use role-based locators (getByRole, getByLabel) for accessibility

Example:
```typescript
import { test, expect } from '../../fixtures/auth.fixture';

test('should do something', async ({ chatPage }) => {
  await chatPage.navigateToNewChat();
  await chatPage.sendMessage('Hello');
  await chatPage.waitForAIResponse();

  const messages = await chatPage.getMessages();
  expect(messages.length).toBeGreaterThan(0);
});
```

**Test Configuration:**
- Config: `playwright.config.ts`
- Auth state saved to: `tests/.auth/user.json` (includes sessionStorage)
- Environment: `.env.test`
- Setup script: `tests/e2e/auth.setup.ts` (runs before authenticated tests)

**Authentication State Management:**
- Custom sessionStorage capture/restore in fixtures (Playwright doesn't natively support this)
- `auth.setup.ts` manually captures sessionStorage during login
- `auth.fixture.ts` restores sessionStorage before authenticated tests run
- Test isolation: tests that authenticate include cleanup to prevent state contamination

## Git Workflow

**Branching:** Trunk-based development - all work branches from `main` and merges back to `main`

**Branch naming:** `<type>/<ticket>_<description>`

- Types: `feature/`, `bugfix/`, `hotfix/`
- Example: `feature/OAI-232_add_auth_mocks`

**Commits:** Must include ticket number

- Format: `TICKET-NUMBER: Brief description`
- Example: `OAI-232: Add MSW mock infrastructure`

**Pull requests:** Keep small and focused (200-400 lines ideal)

See `docs/git-workflow.md` for detailed guidelines.

## Documentation

**Project Documentation:**

- `docs/color-palette.md` - Complete color system and usage guidelines
- `docs/shadcn-setup.md` - Shadcn/ui integration and customization guide
- `docs/shadcn-components-style-guide.md` - Component design patterns and customization
- `docs/git-workflow.md` - Git workflow and commit guidelines

**External Resources:**

- Claude Code: https://docs.claude.com/docs/claude-code

### Writing Documentation

Documentation should be **concise and optimized for human consumption**:

- **Keep it scannable** - Use clear headings, bullet points, and tables
- **Focus on decisions, not implementation** - Document _why_ and _what_, not verbose _how_
- **Link rather than duplicate** - Reference existing files or official docs instead of copying code
- **Avoid verbose code examples** - Show key patterns only; link to implementation files for details
- **Use practical examples** - Brief, actionable examples over exhaustive listings
- **Target 200-400 lines** - Longer docs should be split into focused guides
- **Update existing docs** - Prefer editing over creating new files when content overlaps

**Good documentation example:**

```markdown
### Button Variants

- `default` - Primary CTAs (Disrupt Green)
- `destructive` - Delete actions (Red)
- `ghost` - Cancel, dismiss actions

See `src/components/ui/button.tsx` for implementation.
```

**Verbose documentation to avoid:**

```markdown
### Button Variants

Here is the complete implementation of all button variants with full code...
[50 lines of code from the actual component file]
```

Remember: AI can consume verbose context, but human developers need **concise, actionable information**.

## Development Principles

1. **Start simple** - Build what's needed, not what might be needed
2. **Iterate** - Improve as requirements become clear
3. **Test** - Write tests for critical logic
4. **Follow best practices** - Use modern standards and conventions from official docs (TypeScript, React, library patterns)
5. **Internal consistency** - Follow established patterns in the codebase
6. **Readability** - Clear code > clever code
