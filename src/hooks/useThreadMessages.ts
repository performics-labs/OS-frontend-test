import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/constants';
import type { ChatMessage } from '@/types';

async function fetchThreadMessages(threadId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get(`${API_ROUTES.THREADS}/${threadId}/messages`);
    const messages = response.data.data.messages;

    console.log('[useThreadMessages] Raw messages from backend:', messages);

    // Transform backend message format to ChatMessage format
    const transformed = messages.map(
        (msg: { id: string; role: string; content: string | Record<string, unknown>; createdAt: string }) => {
            // Parse content if it's a JSON string, otherwise use as-is if already object
            let parsedContent: Record<string, unknown> | null = null;

            if (typeof msg.content === 'string') {
                try {
                    parsedContent = JSON.parse(msg.content);
                } catch {
                    // If parsing fails, treat as plain text
                    return {
                        id: msg.id,
                        role: msg.role,
                        content: msg.content,
                        parts: [{ type: 'text', text: msg.content }],
                        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                    };
                }
            } else if (typeof msg.content === 'object' && msg.content !== null) {
                parsedContent = msg.content;
            }

            // If we have parsed content with parts array (AI SDK v5 format), preserve it
            if (parsedContent && Array.isArray(parsedContent.parts)) {
                return {
                    id: msg.id,
                    role: msg.role,
                    content: '', // AI SDK v5 doesn't use content field
                    parts: parsedContent.parts,
                    createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                };
            }

            // Fallback: extract text content for display
            let textContent = '';
            if (parsedContent) {
                if (parsedContent.content) {
                    if (Array.isArray(parsedContent.content)) {
                        textContent = parsedContent.content
                            .map((c: { text?: string }) => c.text || '')
                            .join('');
                    } else {
                        textContent = String(parsedContent.content);
                    }
                } else if (parsedContent.parts && Array.isArray(parsedContent.parts)) {
                    textContent = parsedContent.parts
                        .filter((p: { type: string }) => p.type === 'text')
                        .map((p: { text?: string }) => p.text || '')
                        .join('');
                }
            }

            return {
                id: msg.id,
                role: msg.role,
                content: textContent,
                parts: [{ type: 'text', text: textContent }],
                createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
            };
        }
    );

    console.log('[useThreadMessages] Transformed messages:', transformed);
    return transformed;
}

export function useThreadMessages(threadId: string | undefined) {
    return useQuery({
        queryKey: ['thread-messages', threadId],
        queryFn: () => fetchThreadMessages(threadId!),
        enabled: !!threadId && threadId !== 'new',
    });
}
