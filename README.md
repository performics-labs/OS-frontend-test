# OneSuite Frontend

React 19 application with TypeScript, Vite, and TailwindCSS v4.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server (default: http://localhost:5000)
npm run dev
```

## Tech Stack

- **React 19.1** with TypeScript 5.8
- **Vite 7** for build tooling
- **TailwindCSS v4** for styling
- **Shadcn/ui** component library (Radix UI)
- **AI SDK** for chat streaming
- **Recharts** for data visualization
- **Zod** for runtime validation
- **Zustand** for state management
- **Vitest** for unit testing
- **Playwright** for E2E testing

## Development

### Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint check
npm run format           # Prettier check
npm test                 # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests (requires backend)
npm run test:e2e:ui      # Open Playwright UI
```

### Environment Variables

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_PORT=5000
```

**Production:**
- `VITE_API_BASE_URL` - Backend API URL (deployed FastAPI service)

## Testing

### Unit Tests (Vitest)

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

Tests mirror source structure: `tests/unit/ComponentName.test.tsx` → `src/ComponentName.tsx`

### E2E Tests (Playwright)

**Prerequisites:**
1. Backend running at `http://localhost:8000`
2. Test user exists: `test@example.com` / `TestPassword123!`
3. Database schema migrated

```bash
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Playwright UI mode
npm run test:e2e:headed     # Run with visible browser
npm run test:e2e:debug      # Debug mode
npm run test:e2e:report     # View test report
```

**Coverage:**
- Authentication flows (login, signup, session persistence)
- Chat interactions (streaming, keyboard shortcuts, error handling)
- Smoke tests (app loading, responsive design, accessibility)

See `docs/` for detailed testing documentation.

## Security

### Security Measures

✅ **XSS Prevention:**
- DOMPurify sanitization for SVG content
- Escape user-generated content

✅ **Open Redirect Prevention:**
- URL validation against whitelist
- Only allow same-origin redirects

✅ **Security Headers:**
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

✅ **Input Validation:**
- Zod schemas for all API contracts
- Runtime validation at boundaries

See `SECURITY_AUDIT_REPORT.md` for full security audit results.

### Security Checklist Before Deploy

- [ ] All user input sanitized (DOMPurify for HTML/SVG)
- [ ] Redirect URLs validated against whitelist
- [ ] Security headers configured in `vercel.json`
- [ ] No sensitive data in logs or error messages
- [ ] Dependencies audited (`npm audit`)
- [ ] HTTPS enforced in production
- [ ] CSP policy tested and verified

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configuration:**
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Node version: 18.x or later

**Environment Variables:**
Set in Vercel dashboard:
- `VITE_API_BASE_URL` - Production backend URL

### Security Headers

Security headers are configured in `vercel.json` and automatically applied on deployment.

**Verify headers:**
```bash
curl -I https://your-domain.com
```

Expected headers:
- `content-security-policy`
- `x-frame-options`
- `x-content-type-options`
- `strict-transport-security`

## Architecture

### Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Shadcn/ui components
│   ├── ai-elements/  # AI chat components
│   ├── campaign/     # Campaign tool visualizations
│   └── artifact/     # Artifact rendering
├── hooks/            # Custom React hooks
├── layouts/          # Layout components
├── pages/            # Page components
├── schemas/          # Zod validation schemas
├── services/         # API clients
├── stores/           # Zustand state stores
├── types/            # TypeScript types
└── utils/            # Utility functions
```

### Key Features

**Campaign Tools:**
- AI-powered marketing campaign generation
- Interactive Recharts visualizations
- Real-time streaming with loading states
- Backend-owns-data architecture

**Chat System:**
- AI SDK streaming integration
- Message persistence with threads
- Keyboard shortcuts (⌘K for new chat)
- Tool call visualization

**Artifact System:**
- Code, text, image, spreadsheet rendering
- Monaco editor for code artifacts
- Excel.js for spreadsheet manipulation
- Inline preview in chat

## Documentation

### Core Documentation

- `CLAUDE.md` - Main project guidelines for Claude Code
- `docs/coding-standards.md` - Code style and best practices
- `docs/tool-rendering.md` - Tool rendering architecture
- `docs/campaign-tools.md` - Campaign visualization implementation
- `docs/artifact-feature.md` - Artifact system design
- `docs/color-palette.md` - TailwindCSS color system
- `docs/shadcn-setup.md` - Shadcn/ui integration guide

### Additional Resources

- `docs/git-workflow.md` - Git branching and commit conventions
- `docs/folder-structure.md` - Project organization
- `docs/eslint-guide.md` - ESLint configuration
- `SECURITY_AUDIT_REPORT.md` - Security audit findings

## Performance

### Optimizations

- Code splitting with React.lazy()
- Route-based lazy loading
- Memo optimization for charts
- Disabled Recharts animations for instant rendering
- Image optimization and lazy loading

### Bundle Analysis

```bash
npm run build
npx vite-bundle-visualizer
```

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change port in .env
VITE_PORT=5001
```

**Backend connection refused:**
- Verify backend running at `http://localhost:8000`
- Check CORS settings in backend
- Verify `VITE_API_BASE_URL` in `.env`

**E2E tests failing:**
- Ensure backend is running
- Verify test user exists in database
- Check database schema is migrated
- Clear browser state: `rm -rf tests/.auth/`

**Security headers not applied:**
- Verify `vercel.json` exists
- Check Vercel deployment logs
- Test with `curl -I https://your-domain.com`

## Contributing

See `docs/git-workflow.md` for branch naming, commit conventions, and PR guidelines.

## License

Proprietary - All rights reserved

---

**OneSuite Frontend** - Built with React 19, TypeScript, and TailwindCSS v4
