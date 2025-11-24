import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { PageContainer } from '@/components/PageContainer';
import { PromptInput, type PromptInputHandle } from '@/components/ai-elements/prompt-input';
import { useRandomPlaceholder, useAuth } from '@/hooks';

export function ChatNewPage() {
    const navigate = useNavigate();
    const inputRef = useRef<PromptInputHandle | null>(null);
    const placeholder = useRandomPlaceholder();
    const { user } = useAuth();

    // Extract first name from display_name (e.g., "John Doe" -> "John")
    const firstName = user?.display_name?.split(' ')[0] || 'User';

    function handleSubmit(text: string) {
        if (!text.trim()) return;

        const chatId = crypto.randomUUID();
        navigate(`/chat/${chatId}`, {
            state: { initialMessage: text },
        });
    }

    return (
        <PageContainer noPadding className="bg-background flex flex-col">
            <div className="relative flex flex-1 flex-col items-center justify-center px-4">
                <div className="relative w-full max-w-3xl">
                    <div className="absolute -top-32 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-4">
                        <img
                            src="/assets/logo.svg"
                            alt="OneSuite Logo"
                            className="h-16 w-auto invert dark:invert-0"
                        />
                        <h1 className="text-foreground text-center text-5xl font-light whitespace-nowrap capitalize">
                            Welcome {firstName}!
                        </h1>
                    </div>
                    <div className="pt-10">
                        <PromptInput
                            ref={inputRef}
                            onSubmit={handleSubmit}
                            placeholder={placeholder}
                            name="message"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                            maxFiles={5}
                            maxFileSize={10}
                            hasStarted={false}
                            minRows={4}
                        />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
