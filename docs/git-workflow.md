# Git Workflow

## Overview

OneSuite follows **trunk-based development**:

- Single main branch (`main`)
- All feature branches created from `main`
- All changes merge back to `main`
- Short-lived feature branches (1-3 days ideal)
- Frequent integration to avoid merge conflicts

## Branch Naming Convention

Branch names must follow this format:

```
<type>/<ticket>_<description>
```

**Branch types:**

- `feature/` - New features or enhancements
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes

**Format:**

- Ticket number (e.g., OAI-123)
- Underscore separator
- Brief kebab-case description

**Examples:**

```bash
feature/OAI-232_add_auth_sso_mocks
bugfix/OAI-456_fix_login_redirect
hotfix/OAI-789_patch_security_vulnerability
feature/OAI-100_user_profile_page
```

## Commit Messages

**Format:** `TICKET-NUMBER: Brief description`

Commit messages must include the ticket number prefix.

**Good examples:**

```bash
git commit -m "OAI-232: Add MSW mock infrastructure"
git commit -m "OAI-456: Fix authentication token refresh bug"
git commit -m "OAI-789: Update button component styles"
```

**Bad examples:**

```bash
git commit -m "updates"              # Missing ticket, vague
git commit -m "fix stuff"            # Missing ticket, unclear
git commit -m "WIP"                  # Missing ticket, not descriptive
git commit -m "Add new feature"      # Missing ticket number
```

**Guidelines:**

- Start with ticket number followed by colon
- Use imperative mood ("Add" not "Added")
- Keep under 72 characters when possible
- Be specific about what changed

## Pull Request Size

**Keep PRs small and focused.** Large PRs are harder to review, more likely to have bugs, and slower to merge.

**Guidelines:**

- Aim for 200-400 lines of changes (excluding tests)
- Single concern per PR (one feature, one bug fix)
- Split large features into multiple PRs
- Each PR should be independently reviewable

**When to split a PR:**

- More than 500 lines changed
- Multiple unrelated changes
- Mix of features, refactoring, and documentation
- Takes more than 30 minutes to review

## Splitting Large PRs

If you have a large PR, break it into smaller, logical chunks that can be reviewed and merged independently.

### Example: Adding Authentication with Mocks

**Bad approach - One massive PR:**

```
feature/OAI-232_add_complete_auth_system
- Documentation updates (100 lines)
- Mock infrastructure (300 lines)
- Mock tests (400 lines)
- UI components (250 lines)
- API integration (150 lines)
Total: 1200 lines
```

**Good approach - Split into 4 PRs:**

```
PR 1: feature/OAI-232_docs_foundation
- CLAUDE.MD
- docs/coding-standards.md
- .gitignore updates
Total: ~150 lines

PR 2: feature/OAI-232_mock_infrastructure
- src/mocks/ setup
- MSW configuration
- Environment setup
Total: ~300 lines

PR 3: feature/OAI-232_mock_tests
- tests/unit/mocks/
- src/types/auth.ts
- docs/mocks/
Total: ~400 lines

PR 4: feature/OAI-232_mock_sso_page
- src/pages/mock-sso/
- Component integration
Total: ~250 lines
```

### How to Split

From your feature branch, create focused branches for each logical piece:

```bash
# You're on your feature branch with all changes
git checkout feature/OAI-232_add_complete_auth_system

# Create first PR branch - Documentation
git checkout -b feature/OAI-232_docs_foundation
git reset main  # Unstage everything
git add CLAUDE.MD docs/coding-standards.md .gitignore
git commit -m "OAI-232: Add coding standards and documentation"
git push -u origin feature/OAI-232_docs_foundation

# Go back to feature branch for next PR
git checkout feature/OAI-232_add_complete_auth_system

# Create second PR branch - Infrastructure
git checkout -b feature/OAI-232_mock_infrastructure
git reset main
git add src/mocks/ src/config/ tests/__setup__/setup.ts
git commit -m "OAI-232: Add MSW mock infrastructure"
git push -u origin feature/OAI-232_mock_infrastructure

# Repeat for remaining PRs...
```

### Merge Strategy

**Sequential merging (recommended):**

1. Create all PR branches from your feature branch
2. Submit PR 1, wait for review and merge to main
3. Submit PR 2, wait for review and merge to main
4. Submit PR 3, wait for review and merge to main
5. Submit PR 4, wait for review and merge to main

**Benefits:**

- Each PR builds on merged work
- Reviewers see changes incrementally
- Easier to identify issues
- Faster review cycles

**Order matters:**

- Documentation first (sets context)
- Infrastructure second (foundation)
- Tests third (proves infrastructure works)
- UI/Integration last (uses infrastructure)

## Pull Request Best Practices

**Title format:** `[TICKET-NUMBER] Brief description`

**Example:**

```
[OAI-232] Add MSW mock infrastructure for auth
```

**Description should include:**

- What changed and why
- Testing instructions
- Screenshots (if UI changes)
- Link to ticket

**Before submitting:**

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code follows coding standards
- [ ] Commit messages include ticket numbers
- [ ] PR is focused and reviewable
- [ ] Self-review completed

## Code Review

**As a reviewer:**

- Review within 24 hours when possible
- Check for coding standard compliance
- Test locally if needed
- Provide constructive feedback
- Approve only if you'd merge it yourself

**As an author:**

- Respond to feedback promptly
- Don't take feedback personally
- Explain decisions when asked
- Update PR based on feedback
- Re-request review after changes

## Common Patterns

**Feature development:**

```bash
git checkout main
git pull
git checkout -b feature/OAI-123_new_feature
# Make changes
git add .
git commit -m "OAI-123: Implement new feature"
git push -u origin feature/OAI-123_new_feature
# Create PR
```

**Bug fix:**

```bash
git checkout main
git pull
git checkout -b bugfix/OAI-456_fix_issue
# Make fix
git add .
git commit -m "OAI-456: Fix issue with login redirect"
git push -u origin bugfix/OAI-456_fix_issue
# Create PR
```

**Hotfix (urgent production fix):**

```bash
git checkout main
git pull
git checkout -b hotfix/OAI-789_critical_fix
# Make critical fix
git add .
git commit -m "OAI-789: Fix critical security vulnerability"
git push -u origin hotfix/OAI-789_critical_fix
# Create PR with urgent label
```

---

_For coding standards, see [coding-standards.md](./coding-standards.md)_
