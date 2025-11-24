# Mock Documentation

This directory contains documentation for MSW (Mock Service Worker) implementations used in OneSuite development and testing.

## Available Mocks

- [Authentication](./auth.md) - SSO authentication flow mocking

## Overview

OneSuite uses MSW to intercept API requests and return mock responses during development and testing. This allows frontend development without a backend dependency.

## Configuration

Enable mocks in your `.env` file:

```bash
VITE_USE_MOCKS=true
```

## Mock Structure

```
src/mocks/
├── browser.ts          # MSW browser worker
├── server.ts           # MSW node server for tests
├── handlers/           # Request handlers by domain
└── utils/              # Mock data generators
```

## Testing

All mock handlers have corresponding unit tests in `tests/unit/mocks/`.

```bash
npm test -- tests/unit/mocks
```

## Adding New Mocks

1. Create handler file in `src/mocks/handlers/`
2. Export handlers from `src/mocks/handlers/index.ts`
3. Create unit tests in `tests/unit/mocks/`
4. Document in this directory

## Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW Testing Best Practices](https://mswjs.io/docs/best-practices/testing)
