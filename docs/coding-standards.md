# OneSuite Coding Standards

Quick reference for coding standards, style preferences, and best practices. For detailed project context, see `CLAUDE.md`.

## Core Principles

1. **Keep it simple** - Favor straightforward solutions over clever code
2. **Write self-documenting code** - Clear naming and structure over excessive comments
3. **Follow industry standards** - Use modern best practices from official docs
4. **Internal consistency** - Follow established patterns in the codebase
5. **Test what matters** - Focus on business logic and user flows
6. **Iterate and improve** - Build what's needed now, refactor when requirements become clear

## Styling

**Use TailwindCSS exclusively** - No inline styles, no CSS/SCSS files

```tsx
// ✅ TailwindCSS utilities
<div className="p-4 bg-blue-500 text-white rounded-lg">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// ✅ Arbitrary values when needed
<div className="bg-[#0078d4]">Custom color</div>

// ❌ No inline styles or CSS imports
```

**Why?** Consistency, maintainability, performance, and no context switching.

## Code Comments

**Only comment non-obvious business logic or complex sections**

```tsx
// ✅ Explains WHY
// Admin users see extended timeout due to compliance requirements
const sessionTimeout = user.role === 'admin' ? 3600000 : 1800000;

// ❌ Obvious comments
// Set the user name
const userName = user.name;
```

**When to comment:**

- Business rules not obvious from code
- Workarounds or edge cases (include ticket reference)
- Complex algorithms or calculations
- Unusual third-party API behavior

**Don't comment:** Obvious code, type signatures, clear function names, JSX structure

## Code Quality

**Avoid over-engineering** - Favor simple, direct solutions

```tsx
// ✅ Simple
const formatUserName = (user: User) => `${user.firstName} ${user.lastName}`;

// ❌ Over-engineered
class UserNameFormatter {
    /* Unnecessary abstraction */
}
```

**DRY Principle** - Extract repeated logic into reusable utilities

```tsx
// ✅ Reusable utility
const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// ❌ Repeated logic in multiple places
<span>${price.toFixed(2)}</span>;
```

## TypeScript

**Use strict typing** - Avoid `any` unless absolutely necessary

```tsx
// ✅ Explicit types
type UserProfile = {
    id: string;
    email: string;
    role: 'admin' | 'user';
};

const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

// ❌ Using any
const fetchUserProfile = async (userId: any): Promise<any> => {
    /* ... */
};
```

**Type organization:**

- Define types in `src/types/`
- **Prefer `type` over `interface`** for consistency
- Use `interface` only for declaration merging or class extension
- Export types alongside related code when domain-specific

## React Patterns

**Use functional components with hooks** - No class components

```tsx
// ✅ Functional component
export function UserCard({ user }: { user: User }) {
    const [isExpanded, setIsExpanded] = useState(false);
    return <div className="rounded border p-4">...</div>;
}

// ❌ Class component (legacy)
export class UserCard extends React.Component {
    /* Don't use */
}
```

**Component guidelines:**

- Keep focused and single-purpose (~200 lines max)
- **Separate logic from JSX** - All logic above `return`, only JSX below
- Extract reusable logic into custom hooks
- Store custom hooks in `src/hooks/`
- Use early returns for loading/error states

```tsx
// Example custom hook
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // Auth logic...
    return { user, loading };
}
```

## Testing

**Test location:** `tests/` directory, mirroring source structure

```
tests/unit/components/UserCard.test.tsx  → src/components/UserCard.tsx
tests/unit/hooks/useAuth.test.ts         → src/hooks/useAuth.ts
```

**What to test:**

- ✅ Critical business logic, user flows, data transformations, API integration, edge cases
- ❌ Implementation details, third-party libraries, trivial code, styling

**Example test:**

```tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from '@/components/UserCard';

describe('UserCard', () => {
    it('displays user name and email', () => {
        const user = { id: '1', name: 'John', email: 'john@example.com' };
        render(<UserCard user={user} />);
        expect(screen.getByText('John')).toBeInTheDocument();
    });
});
```

## File Organization

**Naming conventions:**

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils/Types: `camelCase.ts` (e.g., `formatCurrency.ts`, `user.ts`)
- Tests: `*.test.tsx` or `*.test.ts`

**Import order:**

1. External libraries (React, third-party)
2. Internal modules via path aliases (`@/components`, `@/hooks`)
3. Relative imports (`./`, `../`)

```tsx
// ✅ Organized
import { useState } from 'react';
import { Button } from '@/components';
import { UserCard } from './UserCard';

// ❌ Random order
import { UserCard } from './UserCard';
import { Button } from '@/components';
import { useState } from 'react';
```

**Use path aliases** over relative imports (except for sibling files)

## Error Handling

**User-facing errors** - Clear, actionable messages

```tsx
// ✅ Clear message
try {
    await saveProfile(data);
    toast.success('Profile saved');
} catch (error) {
    toast.error('Failed to save profile. Please try again.');
    console.error('Profile save error:', error);
}

// ❌ Technical error exposed
toast.error(error.message); // Shows "500 Internal Server Error"
```

**Error logging** - Log for debugging, never expose sensitive data (passwords, tokens, etc.)

## Security Best Practices

**Critical security principles** - Follow OWASP Top 10 guidelines

### XSS Prevention

Always sanitize user-generated content before rendering:

```tsx
// ✅ Sanitize SVG content
import DOMPurify from 'dompurify';

<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(userContent, {
      USE_PROFILES: { svg: true, svgFilters: true }
    })
  }}
/>

// ❌ Unsafe - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

**Dependencies:**
- Use `dompurify` for HTML/SVG sanitization
- Install: `npm install dompurify @types/dompurify`

### Open Redirect Prevention

Validate redirect URLs against whitelist:

```tsx
// ✅ Validate redirect URLs
const ALLOWED_DOMAINS = [
  window.location.origin,
  import.meta.env.VITE_API_BASE_URL
].filter(Boolean);

function isValidRedirectUrl(url: string): boolean {
  try {
    if (url.startsWith('/')) return true; // Relative URLs safe

    const urlObj = new URL(url, window.location.origin);
    return ALLOWED_DOMAINS.some(domain => {
      const allowedOrigin = new URL(domain).origin;
      return urlObj.origin === allowedOrigin;
    });
  } catch {
    return false;
  }
}

// Use before redirecting
if (isValidRedirectUrl(redirectUrl)) {
  window.location.href = redirectUrl;
}

// ❌ Unsafe - open redirect vulnerability
window.location.href = params.get('redirect'); // Unvalidated
```

### Security Headers

Production deployments must include security headers via `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; ..." }
      ]
    }
  ]
}
```

**Key headers:**
- `Content-Security-Policy` - Restrict resource loading
- `X-Frame-Options` - Prevent clickjacking
- `X-Content-Type-Options` - Prevent MIME sniffing
- `Strict-Transport-Security` - Enforce HTTPS
- `Referrer-Policy` - Control referrer information

### Input Validation

Always validate and sanitize user input:

```tsx
// ✅ Validate with Zod schemas
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const result = loginSchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
}

// ❌ No validation
await login(email, password); // Accepts any input
```

### Sensitive Data

Never log or expose sensitive information:

```tsx
// ✅ Safe logging
console.log('Login attempt for user:', user.id);

// ❌ Exposes sensitive data
console.log('Login with credentials:', { email, password }); // Never log passwords
console.log('API response:', response); // May contain tokens
```

**Never expose:**
- Passwords or password hashes
- Authentication tokens
- API keys or secrets
- Personal identifying information (PII)
- Session IDs

### Dependencies

Keep dependencies updated and audit regularly:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

**Security Checklist:**
- [ ] Sanitize all user-generated content (XSS)
- [ ] Validate redirect URLs (open redirect)
- [ ] Configure security headers (CSP, X-Frame-Options, etc.)
- [ ] Validate all user input (Zod schemas)
- [ ] Never log sensitive data
- [ ] Keep dependencies updated
- [ ] Use HTTPS in production
- [ ] Implement rate limiting for auth endpoints

## Performance

**Avoid premature optimization** - Write clear code first, optimize when measured

**Common optimizations:**

- `useMemo()` for expensive calculations
- `useCallback()` for functions passed as props
- `lazy()` for code-splitting heavy components

## Git Workflow

See [git-workflow.md](./git-workflow.md) for branch naming, commits, and PR guidelines.

## Accessibility

**Requirements:**

- Use semantic HTML elements
- Add `alt` text to images (`alt=""` for decorative)
- Ensure keyboard navigation works
- Maintain WCAG 2.1 AA color contrast
- Use ARIA attributes when semantic HTML isn't sufficient

```tsx
// ✅ Accessible
<button onClick={handleClick} aria-label="Close dialog">
  <XIcon />
</button>
<img src={avatar} alt="User's profile picture" />

// ❌ Not accessible
<div onClick={handleClick}><XIcon /></div>
<img src={avatar} />
```

## Code Style

**No emojis** - Keep code, comments, and commits professional

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)

---

_OneSuite Coding Standards v1.0 - Last updated: October 2025_
