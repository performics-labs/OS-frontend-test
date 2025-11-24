# Frontend Integration Specification - Projects Module

**Version:** 2.0
**Last Updated:** 2025-11-23
**Module:** Projects (ChatGPT/Claude-style project containers)

---

## 1. Overview

The Projects module provides ChatGPT/Claude-style project containers for organizing related conversations, files, and shared context within a workspace.

**Key Features:**

- Create, read, update, delete projects
- Upload and manage project documents
- Custom instructions for project context (like Claude Projects)
- Tags and color coding for organization
- Associated chat threads

**Base URL:**

- Local: `http://localhost:8000`
- Dev: `https://dev-onesuite.performics.com`
- Prod: `https://onesuite.performics.com`

**API Prefix:** `/api/v1/projects`

**Authentication:** Required for all endpoints (uses httpOnly cookies from auth module)

**Frontend Route Constants:** Always use `API_ROUTES` from `src/constants/routes.ts`:
```typescript
import { API_ROUTES } from '@/constants/routes';

API_ROUTES.PROJECTS              // '/api/v1/projects'
API_ROUTES.PROJECT(id)            // '/api/v1/projects/{id}'
API_ROUTES.PROJECT_DOCUMENTS(id)  // '/api/v1/projects/{id}/documents'
```

---

## 2. API Routes

### 2.1 Create Project

**Endpoint:** `POST /api/v1/projects`

**Description:** Create a new project in a workspace.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
    "title": "Campaign Planning Q1 2025",
    "description": "Strategic planning for Q1 marketing campaigns",
    "workspace_id": "workspace-uuid", // Optional, defaults to user's default workspace
    "visibility": "private", // "private" | "shared" | "workspace"
    "custom_instructions": "Focus on ROI analysis and data-driven recommendations",
    "tags": ["marketing", "q1-2025", "campaigns"],
    "color": "#FF5733", // Optional nice to have hex color for UI
    "metadata": {} // Optional custom metadata
}
```

**Response:** `201 Created`

```json
{
    "id": "proj-uuid",
    "tenant_id": "tenant-123",
    "workspace_id": "workspace-uuid",
    "owner_user_id": "user-uuid",
    "title": "Campaign Planning Q1 2025",
    "description": "Strategic planning for Q1 marketing campaigns",
    "visibility": "private",
    "custom_instructions": "Focus on ROI analysis and data-driven recommendations",
    "tags": ["marketing", "q1-2025", "campaigns"],
    "color": "#FF5733",
    "chat_count": 0,
    "file_count": 0,
    "last_activity_at": null,
    "created_at": "2025-10-27T10:30:00Z",
    "updated_at": null,
    "can_edit": true,
    "can_share": true,
    "can_delete": true
}
```

**Errors:**

- `400 Bad Request` - Invalid request data (title too long, invalid visibility, etc.)
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - PROJECTS capability not enabled for tenant
- `500 Internal Server Error` - Server error

---

### 2.2 List Projects

**Endpoint:** `GET /api/v1/projects?workspace_id={workspace_id}`

**Description:** List all projects accessible to the user in a workspace.

**Query Parameters:**

- `workspace_id` (required): Workspace ID to filter projects

**Request Headers:**

```
Content-Type: application/json
```

**Response:** `200 OK`

```json
{
    "projects": [
        {
            "id": "proj-1",
            "tenant_id": "tenant-123",
            "workspace_id": "workspace-uuid",
            "owner_user_id": "user-uuid",
            "title": "Campaign Planning Q1 2025",
            "description": "Strategic planning for Q1 marketing campaigns",
            "visibility": "private",
            "custom_instructions": "Focus on ROI analysis",
            "tags": ["marketing", "q1-2025"],
            "color": "#FF5733",
            "chat_count": 5,
            "file_count": 3,
            "last_activity_at": "2025-10-27T10:30:00Z",
            "created_at": "2025-10-20T10:00:00Z",
            "updated_at": "2025-10-27T10:30:00Z",
            "can_edit": true,
            "can_share": true,
            "can_delete": true
        },
        {
            "id": "proj-2",
            "tenant_id": "tenant-123",
            "workspace_id": "workspace-uuid",
            "owner_user_id": "other-user-uuid",
            "title": "Shared Project",
            "visibility": "shared",
            "tags": [],
            "color": null,
            "chat_count": 2,
            "file_count": 1,
            "last_activity_at": "2025-10-26T15:00:00Z",
            "created_at": "2025-10-15T09:00:00Z",
            "updated_at": null,
            "can_edit": false,
            "can_share": false,
            "can_delete": false
        }
    ],
    "total_count": 2,
    "owned_count": 1,
    "shared_count": 1
}
```

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - PROJECTS capability not enabled
- `500 Internal Server Error` - Server error

---

### 2.3 Get Project Details

**Endpoint:** `GET /api/v1/projects/{project_id}`

**Description:** Get detailed information about a specific project.

**Path Parameters:**

- `project_id` (required): Project ID

**Response:** `200 OK`

```json
{
    "id": "proj-uuid",
    "tenant_id": "tenant-123",
    "workspace_id": "workspace-uuid",
    "owner_user_id": "user-uuid",
    "title": "Campaign Planning Q1 2025",
    "description": "Strategic planning for Q1 marketing campaigns",
    "visibility": "private",
    "custom_instructions": "Focus on ROI analysis and data-driven recommendations",
    "tags": ["marketing", "q1-2025", "campaigns"],
    "color": "#FF5733",
    "chat_count": 5,
    "file_count": 3,
    "last_activity_at": "2025-10-27T10:30:00Z",
    "created_at": "2025-10-20T10:00:00Z",
    "updated_at": "2025-10-27T10:30:00Z",
    "can_edit": true,
    "can_share": true,
    "can_delete": true
}
```

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - No access to project or PROJECTS capability not enabled
- `404 Not Found` - Project not found or access denied
- `500 Internal Server Error` - Server error

---

### 2.4 Update Project

**Endpoint:** `PATCH /api/v1/projects/{project_id}`

**Description:** Update an existing project. Only updatable fields need to be included.

**Path Parameters:**

- `project_id` (required): Project ID

**Request Body (all fields optional):**

```json
{
    "title": "Updated Campaign Planning Q1 2025",
    "description": "Updated description",
    "visibility": "workspace",
    "custom_instructions": "Updated instructions",
    "tags": ["marketing", "q1-2025", "revised"],
    "color": "#00FF00",
    "metadata": { "updated": true }
}
```

**Response:** `200 OK`

```json
{
    "id": "proj-uuid",
    "tenant_id": "tenant-123",
    "workspace_id": "workspace-uuid",
    "owner_user_id": "user-uuid",
    "title": "Updated Campaign Planning Q1 2025",
    "description": "Updated description",
    "visibility": "workspace",
    "custom_instructions": "Updated instructions",
    "tags": ["marketing", "q1-2025", "revised"],
    "color": "#00FF00",
    "chat_count": 5,
    "file_count": 3,
    "last_activity_at": "2025-10-27T11:00:00Z",
    "created_at": "2025-10-20T10:00:00Z",
    "updated_at": "2025-10-27T11:00:00Z",
    "can_edit": true,
    "can_share": true,
    "can_delete": true
}
```

**Errors:**

- `400 Bad Request` - Invalid update data
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - No edit permission or PROJECTS capability not enabled
- `404 Not Found` - Project not found
- `500 Internal Server Error` - Server error

---

### 2.5 Delete Project

**Endpoint:** `DELETE /api/v1/projects/{project_id}`

**Description:** Delete a project (soft delete). Only the owner can delete projects.

**Path Parameters:**

- `project_id` (required): Project ID

**Response:** `204 No Content`

No response body.

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not the project owner or PROJECTS capability not enabled
- `404 Not Found` - Project not found
- `500 Internal Server Error` - Server error

---

### 2.6 Share Project

**Endpoint:** `POST /api/v1/projects/{project_id}/share`

**Description:** Share a project with a specific user or role. Only the owner can share.

**Path Parameters:**

- `project_id` (required): Project ID

**Request Body:**

```json
{
    "shared_with_user_id": "user-uuid", // Share with specific user
    "shared_with_role": null, // OR share with role (not both)
    "permission": "viewer" // "viewer" | "editor" | "owner"
}
```

**Alternative - Share with Role:**

```json
{
    "shared_with_user_id": null,
    "shared_with_role": "analyst", // "analyst" | "manager" | etc.
    "permission": "editor"
}
```

**Response:** `201 Created`

```json
{
    "id": "share-uuid",
    "project_id": "proj-uuid",
    "shared_with_user_id": "user-uuid",
    "shared_with_role": null,
    "permission": "viewer",
    "shared_by_user_id": "owner-uuid",
    "shared_at": "2025-10-27T11:30:00Z"
}
```

**Errors:**

- `400 Bad Request` - Invalid share request (must specify user OR role, not both)
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not the project owner or PROJECTS capability not enabled
- `404 Not Found` - Project not found
- `500 Internal Server Error` - Server error

---

### 2.7 Unshare Project

**Endpoint:** `DELETE /api/v1/projects/{project_id}/share/{share_id}`

**Description:** Remove a share from a project. Only the owner can unshare.

**Path Parameters:**

- `project_id` (required): Project ID
- `share_id` (required): Share ID to remove

**Response:** `204 No Content`

No response body.

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not the project owner or PROJECTS capability not enabled
- `404 Not Found` - Project or share not found
- `500 Internal Server Error` - Server error

---

### 2.8 List Project Shares

**Endpoint:** `GET /api/v1/projects/{project_id}/shares`

**Description:** List all shares for a project. Only the owner can view shares.

**Path Parameters:**

- `project_id` (required): Project ID

**Response:** `200 OK`

```json
[
    {
        "id": "share-1",
        "project_id": "proj-uuid",
        "shared_with_user_id": "user-1-uuid",
        "shared_with_role": null,
        "permission": "viewer",
        "shared_by_user_id": "owner-uuid",
        "shared_at": "2025-10-27T11:30:00Z"
    },
    {
        "id": "share-2",
        "project_id": "proj-uuid",
        "shared_with_user_id": null,
        "shared_with_role": "analyst",
        "permission": "editor",
        "shared_by_user_id": "owner-uuid",
        "shared_at": "2025-10-26T09:00:00Z"
    }
]
```

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not the project owner or PROJECTS capability not enabled
- `404 Not Found` - Project not found
- `500 Internal Server Error` - Server error
