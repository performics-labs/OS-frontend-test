# Authentication Mocking

## Overview

Mock SSO authentication flow using MSW. Simulates the full OAuth-like authorization code flow without requiring a real backend.

## Auth Flow

### 1. Login Redirect

**Endpoint:** `GET /auth/login`

Returns mock SSO authorization URL.

**Response:**

```json
{
    "redirect_url": "http://localhost:5000/mock-sso/authorize?client_id=mock-client&redirect_uri=..."
}
```

### 2. Mock SSO Page

Internal page at `/mock-sso/authorize` where users enter their email. Generates authorization code and redirects to callback.

**Code format:** `mock-code-{base64Email}-{timestamp}`

### 3. Auth Callback

**Endpoint:** `POST /auth/callback`

Exchanges authorization code for user session.

**Request:**

```json
{
    "code": "mock-code-dXNlckBwdWJsaWNpc2dyb3VwZS5jb20=-1234567890"
}
```

**Response:**

```json
{
    "user_id": "uuid",
    "email": "user@publicisgroupe.com",
    "display_name": "User Name",
    "tenant_id": "tenant-mock-123",
    "roles": [],
    "consent": {
        "telemetry": true,
        "model_training": false,
        "marketing": false
    },
    "session": {
        "sid": "uuid",
        "expires_at": "2024-10-08T16:00:00.000Z"
    }
}
```

**Cookies:**

- `os_session` - Session cookie (15 min)
- `os_refresh` - Refresh token (7 days)

**Errors:**

- `400` - Invalid or missing code
- `403` - Unauthorized domain

### 4. Session Check

**Endpoint:** `GET /auth/session`

Returns current user session if valid cookie exists.

**Response:** User session object

**Error:** `401` if no session cookie

### 5. Logout

**Endpoint:** `POST /auth/logout`

Clears session cookies.

**Response:** `204 No Content`

## Domain Validation

Allowed domains:

- `@publicisgroupe.com`
- `@publicisgroupe.net`

Other domains return `403`:

```json
{
    "error": "unauthorized_domain",
    "message": "Access restricted to Publicis Groupe employees only."
}
```

## Role Assignment

Automatic role assignment based on email:

- Contains "admin" → `roles: ["admin"]`
- All others → `roles: []`

**Examples:**

- `admin@publicisgroupe.com` → Admin
- `john.admin@publicisgroupe.net` → Admin
- `user@publicisgroupe.com` → Regular user

## User Generation

Mock users are generated from email addresses:

**Display name:**

- Extract username before @
- Replace `.`, `_`, `-` with spaces
- Capitalize each word

**Examples:**

- `john.doe@publicisgroupe.com` → "John Doe"
- `jane_smith@publicisgroupe.com` → "Jane Smith"

**Default values:**

- `user_id` - Random UUID
- `tenant_id` - "tenant-mock-123"
- `session.sid` - Random UUID
- `session.expires_at` - 15 minutes from now
- `consent.telemetry` - true
- `consent.model_training` - false
- `consent.marketing` - false

## Implementation

**Handlers:** `src/mocks/handlers/auth.handlers.ts`

**User generator:** `src/mocks/utils/user-generator.ts`

**Tests:** `tests/unit/mocks/auth.handlers.test.ts`

## Testing Notes

Cookie validation in Node/MSW tests requires handler overrides. See test file for examples.

Browser environment supports full cookie functionality.
