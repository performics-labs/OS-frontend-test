/**
 * Strip YAML frontmatter from markdown content
 * @param content - Markdown content that may contain YAML frontmatter
 * @returns Markdown content without frontmatter
 */
export function stripYamlFrontmatter(content: string): string {
    if (!content) return '';

    // Check if content starts with YAML frontmatter (---)
    const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n/s;
    const match = content.match(frontmatterRegex);

    if (match) {
        // Return content without frontmatter
        return content.slice(match[0].length);
    }

    return content;
}

/**
 * Extract YAML frontmatter from markdown content
 * @param content - Markdown content that may contain YAML frontmatter
 * @returns Frontmatter as a string, or null if none exists
 */
export function extractYamlFrontmatter(content: string): string | null {
    if (!content) return null;

    const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n/s;
    const match = content.match(frontmatterRegex);

    if (match) {
        return match[1];
    }

    return null;
}

/**
 * Add YAML frontmatter to markdown content
 * @param content - Markdown content
 * @param frontmatter - YAML frontmatter as a string
 * @returns Combined content with frontmatter
 */
export function addYamlFrontmatter(content: string, frontmatter: string): string {
    if (!frontmatter) return content;

    // Strip existing frontmatter first
    const cleanContent = stripYamlFrontmatter(content);

    return `---\n${frontmatter}\n---\n${cleanContent}`;
}
