import type { UIMessage, FileUIPart } from 'ai';

// Feedback types
export type FeedbackType = 'up' | 'down';
export type FeedbackStatus = FeedbackType | 'none';

// Message metadata type
export type MessageMetadata = {
    createdAt?: number;
    model?: string;
    totalTokens?: number;
    feedback?: FeedbackStatus;
};

// File attachment types (using FileUIPart which is the UI-safe file type)
export type FileAttachment = FileUIPart;

// Tool-specific part types extending AI SDK's message parts
export type ToolCallPart = {
    type: 'tool-call';
    toolName: string;
    toolCallId: string;
    status: 'streaming' | 'complete' | 'error';
    input?: unknown;
};

export type ToolResultPart = {
    type: 'tool-result';
    toolName: string;
    toolCallId: string;
    output?: unknown;
    error?: string;
};

// RAG-specific output structure
export type RagDocument = {
    title: string;
    snippet: string;
    relevance: number;
    source?: string;
};

export type RagOutput = {
    documents: RagDocument[];
};

// Custom UI data types for AI SDK streaming
// These match the data-* stream event types for artifacts
export type CustomUIDataTypes = {
    id: string;
    title: string;
    kind: 'text' | 'code' | 'image' | 'spreadsheet';
    codeDelta: string;
    textDelta: string;
    imageDelta: string;
    spreadsheetDelta: string;
    clear: null;
    finish: null;
};

// ChatMessage now includes custom data types for artifact streaming
export type ChatMessage = UIMessage<MessageMetadata, CustomUIDataTypes>;

// Legacy type for backward compatibility during transition
export type SimpleChatMessage = {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isStreaming?: boolean;
};

export type ChatRequestMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

export type ChatRequestBody = {
    messages: ChatRequestMessage[];
};

export type ChatPrompt = {
    id: string;
    title: string;
    description: string;
    prompt: string;
    icon?: string;
};

export type ChatInterfaceProps = {
    initialPrompt?: string;
    onSubmit?: (message: string) => void;
    prompts?: ChatPrompt[];
    onPromptSelect?: (prompt: ChatPrompt) => void;
    projectId?: string;
};

// Helper functions for working with file attachments
export function extractFileParts(message: ChatMessage): FileUIPart[] {
    return message.parts.filter((part): part is FileUIPart => part.type === 'file');
}

export function hasFileAttachments(message: ChatMessage): boolean {
    return message.parts.some((part) => part.type === 'file');
}
