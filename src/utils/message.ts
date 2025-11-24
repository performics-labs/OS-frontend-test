import type { ChatMessage } from '@/types/chat';

/**
 * Extracts all text content from a message's parts.
 * Filters for text-type parts and joins them together.
 */
export function extractTextContent(message: ChatMessage, separator = ''): string {
    return message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(separator);
}
