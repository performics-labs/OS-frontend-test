# Frontend API v1 Migration

This document describes the frontend changes required to support the backend's API v1 migration.

## Overview

The backend has migrated all endpoints to use the `/api/v1` prefix. The frontend has been updated to use these new endpoint URLs.

## Changes Made

### 1. API Route Constants Updated

**File:** `src/constants/routes.ts`

All API endpoint constants have been updated to include the `/api/v1` prefix:

```typescript
export const API_ROUTES = Object.freeze({
    // Auth endpoints (v1)
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    SESSION: '/api/v1/auth/session',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',

    // Utility endpoints (no version prefix)
    MODELS: '/api/models',
    HEALTH: '/api/health',
    CHAT: '/api/chat',

    // Thread endpoints (v1)
    THREADS: '/api/v1/threads',
    PROJECT_THREADS: (id: string) => `/api/v1/threads/project/${id}`,

    // Project endpoints (v1)
    PROJECTS: '/api/v1/projects',
    PROJECT: (id: string) => `/api/v1/projects/${id}`,
    PROJECT_DOCUMENTS: (id: string) => `/api/v1/projects/${id}/documents`,
    PROJECT_DOCUMENT: (projectId: string, documentId: string) =>
        `/api/v1/projects/${projectId}/documents/${documentId}`,

    // Knowledge Base endpoints (v1)
    KB_DOCS: '/api/v1/kb-docs',
    KB_DOCS_TREE: '/api/v1/kb-docs/tree',
    KB_DOC: (id: string) => `/api/v1/kb-docs/${id}`,
    KB_DOC_BY_SLUG: (slug: string) => `/api/v1/kb-docs/slug/${slug}`,
    KB_DOC_PUBLISH: (id: string) => `/api/v1/kb-docs/${id}/publish`,
    KB_DOC_UNPUBLISH: (id: string) => `/api/v1/kb-docs/${id}/unpublish`,
    KB_DOC_LOCK: (id: string) => `/api/v1/kb-docs/${id}/lock`,
    KB_DOC_UNLOCK: (id: string) => `/api/v1/kb-docs/${id}/unlock`,
    KB_DOC_VERSIONS: (id: string) => `/api/v1/kb-docs/${id}/versions`,
    KB_DOC_RESTORE: (id: string) => `/api/v1/kb-docs/${id}/restore`,
} as const);
```

### 2. MSW Mock Handlers Updated

**Files Updated:**
- `src/mocks/handlers/auth.handlers.ts`
- `src/mocks/handlers/project.handlers.ts`

All MSW mock handlers have been updated to match the new endpoint URLs:

```typescript
// Auth handlers
http.post('/api/v1/auth/login', ...)
http.post('/api/v1/auth/register', ...)
http.get('/api/v1/auth/session', ...)
http.post('/api/v1/auth/logout', ...)
http.post('/api/v1/auth/refresh', ...)

// Project handlers
http.get('/api/v1/projects', ...)
http.get('/api/v1/projects/:id', ...)
http.post('/api/v1/projects', ...)
http.put('/api/v1/projects/:id', ...)
http.delete('/api/v1/projects/:id', ...)
http.get('/api/v1/projects/:id/documents', ...)
http.post('/api/v1/projects/:id/documents', ...)
http.delete('/api/v1/projects/:projectId/documents/:documentId', ...)
```

## Endpoints NOT Versioned

The following endpoints remain at the root `/api` level (not versioned):

- `/api/models` - List available AI models
- `/api/health` - Health check endpoint
- `/api/chat` - Main chat streaming endpoint

These endpoints are utility/infrastructure endpoints that don't require versioning.

## Testing

### Local Development

1. Start backend with updated endpoints:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Test authentication flow:
   - Login/register
   - Session check
   - Logout

4. Test API endpoints:
   - Create/view projects
   - Upload/view documents
   - Browse knowledge base

### Mock Mode

When using mocks (`VITE_USE_MOCKS=true`), all endpoints work through MSW handlers without backend:

```bash
cd frontend
VITE_USE_MOCKS=true npm run dev
```

## Backward Compatibility

**There is NO backward compatibility layer.** All endpoints must use the new `/api/v1` prefix.

If you encounter 404 errors:
1. Check that the backend is running the latest version
2. Verify `API_ROUTES` constants are being used (not hardcoded paths)
3. Clear browser cache/storage if needed

## Migration Checklist

- ✅ Updated API route constants in `src/constants/routes.ts`
- ✅ Updated MSW mock handlers for auth endpoints
- ✅ Updated MSW mock handlers for project endpoints
- ✅ Verified utility endpoints remain unversioned (`/api/chat`, `/api/models`, `/api/health`)
- ✅ All services use `API_ROUTES` constants (no hardcoded paths)
- ✅ Documentation updated

## Service Layer

All service functions use the `API_ROUTES` constants, so no changes were needed:

```typescript
// src/services/auth/auth-service.ts
export async function loginWithEmail(data: LoginRequest) {
    const response = await apiClient.post<AuthResponse>(API_ROUTES.LOGIN, data);
    return response;
}

// src/services/threads/thread-service.ts
export async function fetchThreads(limit: number = 50): Promise<Thread[]> {
    const response = await apiClient.get(API_ROUTES.THREADS, {
        params: { limit },
    });
    return response.data;
}

// src/services/projects/project-service.ts
export async function fetchProjects(): Promise<Project[]> {
    const response = await apiClient.get(API_ROUTES.PROJECTS);
    return response.data;
}
```

## API Client Configuration

The API client configuration remains unchanged:

```typescript
// src/lib/api-client.ts
const apiClient = axios.create({
    baseURL: API_BASE_URL, // from .env: VITE_API_BASE_URL
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
```

## Troubleshooting

### 404 Not Found Errors

If you see 404 errors after the migration:

1. **Check backend is running latest version:**
   ```bash
   cd backend
   git pull
   uvicorn main:app --reload
   ```

2. **Verify environment variables:**
   ```bash
   # frontend/.env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Check browser console for actual URLs being called**

4. **Clear browser cache and storage:**
   - Open DevTools → Application → Clear site data

### Mock Handlers Not Working

If mocks aren't intercepting requests:

1. **Verify MSW is properly initialized:**
   - Check `src/mocks/browser.ts` is imported in `main.tsx`
   - Check `VITE_USE_MOCKS=true` in `.env`

2. **Check mock handler URLs match exactly:**
   - Must use full path with `/api/v1` prefix
   - Use browser DevTools → Network tab to see actual URLs

### Session/Auth Issues

If authentication isn't working:

1. **Check cookies are being set:**
   - DevTools → Application → Cookies
   - Look for `os_session` cookie

2. **Verify CORS and credentials:**
   - `withCredentials: true` in axios config
   - Backend CORS allows credentials

3. **Test session endpoint directly:**
   ```bash
   curl -X GET http://localhost:8000/api/v1/auth/session \
     -H "Cookie: os_session=YOUR_SESSION_TOKEN"
   ```

## Related Documentation

- Backend Migration Guide: `backend/docs/API_V1_MIGRATION.md`
- Backend Architecture: `backend/docs/ARCHITECTURE_V2.md`
- Frontend Guidelines: `frontend/CLAUDE.md`

---

**Migration completed:** 2024-11-23
**Frontend version:** Updated to support backend API v1
**Breaking changes:** All API endpoint URLs changed
