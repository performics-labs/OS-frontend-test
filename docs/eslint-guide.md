# ESLint Configuration Guide

This document explains our ESLint setup, coding standards, and how to work with the linting rules in this project.

## Overview

Our ESLint configuration enforces consistent code style, catches common errors, and ensures accessibility standards across the React TypeScript codebase. It's built on top of industry-standard presets and includes custom rules tailored to our development workflow.

## Configuration Structure

We use ESLint's modern **flat config** format (`eslint.config.js`) with the following key components:

- **Base Extensions**: ESLint recommended + TypeScript ESLint + React Hooks + Vite React Refresh
- **Additional Plugins**: React, JSX Accessibility, Import organization
- **File-specific Rules**: Different configurations for TypeScript, JavaScript, and test files

## Key Coding Standards

### Code Style

```javascript
// ✅ Good - Single quotes, semicolons, const preference
const message = 'Hello world';
const items = ['apple', 'banana'];

// ❌ Bad - Double quotes, no semicolons, unnecessary var
var message = 'Hello world';
let items = ['apple', 'banana'];
```

### React Components

```jsx
// ✅ Good - Self-closing tags, proper key props, PascalCase
const UserList = ({ users }) => (
    <div>
        {users.map((user) => (
            <UserCard key={user.id} user={user} />
        ))}
    </div>
);

// ❌ Bad - Missing keys, improper closing, lowercase component
const userlist = ({ users }) => (
    <div>
        {users.map((user) => (
            <usercard user={user}></usercard>
        ))}
    </div>
);
```

### Import Organization

```javascript
// ✅ Good - Grouped and sorted imports
import React from 'react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

import { formatDate } from '../utils/date';
import { UserCard } from './UserCard';

// ❌ Bad - Random import order
import { UserCard } from './UserCard';
import React from 'react';
import { api } from '@/services/api';
import { formatDate } from '../utils/date';
```

## Rule Categories

### 🚨 Error Rules (Will Break Build)

- `no-unused-vars` - Unused variables/imports
- `react/jsx-key` - Missing key props in lists
- `eqeqeq` - Must use strict equality (===)
- `react-hooks/rules-of-hooks` - Proper hook usage
- `jsx-a11y/alt-text` - Missing alt text on images

### ⚠️ Warning Rules (Should Fix)

- `no-console` - Console statements (remove for production)
- `@typescript-eslint/no-explicit-any` - Avoid using `any` type
- `react-hooks/exhaustive-deps` - Missing effect dependencies

### 🎨 Style Rules (Auto-fixable)

- `quotes` - Single quotes preferred
- `semi` - Semicolons required
- `jsx-indent` - 2-space indentation
- `import/order` - Import organization

## Working with ESLint

### Running ESLint

```bash
# Check all files
npm run lint

# Auto-fix fixable issues
npm run lint:fix

# Check specific files
npx eslint src/components/UserCard.tsx

# Check and fix specific files
npx eslint src/components/UserCard.tsx --fix
```

### IDE Integration

#### VS Code

Install the **ESLint extension** and add this to your workspace settings:

```json
{
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "eslint.format.enable": true
}
```

#### Other IDEs

- **WebStorm**: ESLint is built-in and auto-detected
- **Vim/Neovim**: Use coc-eslint or native LSP
- **Sublime**: Install SublimeLinter-eslint

### Disabling Rules

Sometimes you need to disable rules for specific cases:

```javascript
// Disable for next line
// eslint-disable-next-line no-console
console.log('Debug info');

// Disable for entire file
/* eslint-disable no-console */

// Disable specific rule for block
/* eslint-disable react-hooks/exhaustive-deps */
useEffect(() => {
    // Complex effect that ESLint doesn't understand
}, []);
/* eslint-enable react-hooks/exhaustive-deps */
```

**⚠️ Use sparingly!** Always prefer fixing the issue over disabling the rule.

## Common Issues & Solutions

### "React is not defined" Error

**Solution**: This is normal in React 17+. The rule `react/react-in-jsx-scope` is disabled.

### Import Order Warnings

**Solution**: Use the auto-fix feature (`npm run lint:fix`) or manually organize imports by:

1. External libraries (react, lodash, etc.)
2. Internal modules (@/components, @/utils)
3. Relative imports (./Component, ../utils)

### Accessibility Warnings

**Solution**:

- Add `alt` attributes to images
- Ensure proper ARIA labels
- Use semantic HTML elements
- Test with screen readers when possible

### Hook Dependencies

**Solution**: Add missing dependencies to dependency arrays or use `useCallback`/`useMemo` when appropriate.

```javascript
// ✅ Good
useEffect(() => {
    fetchData(userId);
}, [userId]); // userId added to deps

// ✅ Also good with useCallback
const memoizedFetch = useCallback(() => {
    fetchData(userId);
}, [userId]);

useEffect(() => {
    memoizedFetch();
}, [memoizedFetch]);
```

## File-Specific Configurations

### TypeScript Files (`*.ts`, `*.tsx`)

- Full rule set applies
- TypeScript-specific rules enabled
- React and JSX rules active

### JavaScript Files (`*.js`, `*.jsx`)

- Core JavaScript and React rules
- TypeScript-specific rules disabled
- Relaxed configuration for legacy code

### Test Files (`*.test.*`, `*.spec.*`)

- Relaxed console.log rules
- Non-null assertion allowed
- Jest globals available

## Customizing Rules

To modify rules, edit `eslint.config.js`:

```javascript
rules: {
  // Make a warning into an error
  'no-console': 'error',

  // Turn off a rule entirely
  'react/jsx-max-props-per-line': 'off',

  // Customize rule options
  'quotes': ['error', 'double'], // Prefer double quotes

  // Add new rule
  'prefer-arrow-callback': 'error'
}
```

## Best Practices

1. **Run linting before commits** - Set up pre-commit hooks
2. **Fix auto-fixable issues** - Use `--fix` flag regularly
3. **Address warnings promptly** - Don't let them accumulate
4. **Understand before disabling** - Research why a rule exists
5. **Discuss team changes** - Get consensus before modifying rules
6. **Keep dependencies updated** - Regular ESLint and plugin updates

## Getting Help

- **ESLint Documentation**: [eslint.org](https://eslint.org/)
- **TypeScript ESLint**: [typescript-eslint.io](https://typescript-eslint.io/)
- **React Plugin**: [github.com/jsx-eslint/eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)
- **Accessibility Plugin**: [github.com/jsx-eslint/eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

For project-specific questions, ask in our team chat or create an issue in the repository.
