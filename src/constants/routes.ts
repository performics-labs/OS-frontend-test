export const APP_ROUTES = Object.freeze({
    CHAT_NEW: '/chat/new',
    CHAT: '/chat/:id',
    LOGIN: '/login',
    COMPONENT_SHOWCASE: '/showcase',
    DESIGN_SYSTEM: '/design-system',
    TOOLS_SHOWCASE: '/tools-showcase',
    AI_ELEMENTS_TEST: '/ai-elements-test',
    AI_ELEMENTS_CHAT_NEW: '/ai-elements-chat',
    AI_ELEMENTS_CHAT: '/ai-elements-chat/:id',
    PROJECTS: '/projects',
    PROJECT_DETAIL: '/projects/:id',
    KNOWLEDGE_BASE: '/knowledge-base',
} as const);

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

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

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];
