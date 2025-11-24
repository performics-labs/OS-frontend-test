export const ARTIFACT_Z_INDEX = {
    BACKGROUND_OVERLAY: 50, // Background dimming layer
    ARTIFACT_PANEL: 51, // Artifact content panel
    CLOSE_BUTTON: 52, // Close button (always on top)
} as const;

/**
 * Animation configuration for Framer Motion
 */
export const ARTIFACT_ANIMATION = {
    // Spring physics for smooth animations
    spring: {
        stiffness: 200,
        damping: 30,
    },
    // Animation duration in milliseconds
    duration: 300,
    // Easing functions
    ease: 'easeInOut',
} as const;

/**
 * Responsive breakpoints (matches Tailwind)
 */
export const ARTIFACT_BREAKPOINTS = {
    MOBILE_MAX: 768, // Mobile: < 768px
    DESKTOP_MIN: 768, // Desktop: >= 768px
} as const;

/**
 * Layout dimensions
 */
export const ARTIFACT_LAYOUT = {
    // Desktop: chat panel width
    CHAT_PANEL_WIDTH: 400,
    // Mobile: full screen
    MOBILE_FULL_SCREEN: '100%',
} as const;

/**
 * Artifact type values
 */
export const ARTIFACT_TYPES = {
    TEXT: 'text',
    CODE: 'code',
    IMAGE: 'image',
    SPREADSHEET: 'spreadsheet',
} as const;

/**
 * Valid artifact type values for runtime validation
 */
export const VALID_ARTIFACT_TYPES = Object.values(ARTIFACT_TYPES);
