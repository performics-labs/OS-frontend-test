/**
 * Application Configuration Constants
 *
 * Centralized configuration for timeouts, limits, and other app-level settings.
 * This prevents hardcoded values scattered throughout the codebase.
 */

// API Configuration
export const API_CONFIG = {
    /** Default timeout for API requests (ms) */
    TIMEOUT: 10000,
    /** Retry attempts for failed requests */
    MAX_RETRIES: 3,
    /** Delay between retries (ms) */
    RETRY_DELAY: 1000,
} as const;

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
    /** Maximum file size in MB */
    MAX_FILE_SIZE_MB: 10,
    /** Maximum number of files per upload */
    MAX_FILES: 5,
    /** Accepted file types */
    ACCEPTED_TYPES: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv',
} as const;

// Animation Configuration
export const ANIMATION_CONFIG = {
    /** Default transition duration (ms) */
    DURATION: 200,
    /** Fast transition duration (ms) */
    DURATION_FAST: 100,
    /** Slow transition duration (ms) */
    DURATION_SLOW: 300,
    /** Spring stiffness for animations */
    SPRING_STIFFNESS: 300,
    /** Spring damping for animations */
    SPRING_DAMPING: 30,
} as const;

// React Query Configuration
export const REACT_QUERY_CONFIG = {
    /** Default stale time for queries (ms) */
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    /** Cache time for inactive queries (ms) */
    CACHE_TIME: 10 * 60 * 1000, // 10 minutes
    /** Number of retry attempts */
    RETRY: 3,
} as const;

// UI Configuration
export const UI_CONFIG = {
    /** Debounce delay for search inputs (ms) */
    SEARCH_DEBOUNCE: 300,
    /** Toast notification duration (ms) */
    TOAST_DURATION: 3000,
    /** Sidebar width (px) */
    SIDEBAR_WIDTH: 256,
    /** Mobile breakpoint (px) */
    MOBILE_BREAKPOINT: 768,
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
    /** Default items per page */
    DEFAULT_PAGE_SIZE: 25,
    /** Maximum items per page */
    MAX_PAGE_SIZE: 100,
} as const;

// Chat Configuration
export const CHAT_CONFIG = {
    /** Minimum textarea rows */
    MIN_TEXTAREA_ROWS: 1,
    /** Maximum textarea rows before scroll */
    MAX_TEXTAREA_ROWS: 10,
    /** Maximum message length */
    MAX_MESSAGE_LENGTH: 10000,
} as const;
