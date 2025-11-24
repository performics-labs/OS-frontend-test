import { useParams, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { Artifact } from '@/components/artifact/Artifact';
import { useArtifact } from '@/hooks/useArtifact';
import { useThreadMessages } from '@/hooks/useThreadMessages';
import { ARTIFACT_ANIMATION } from '@/constants/artifacts';
import { Loader2 } from 'lucide-react';

export function ChatPage() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const locationState = location.state as {
        initialMessage?: string;
        sourceProject?: { id: string; name: string };
    };
    const initialMessage = locationState?.initialMessage;
    const projectId = locationState?.sourceProject?.id;
    const { isOpen } = useArtifact();
    const [artifactContainer, setArtifactContainer] = useState<HTMLDivElement | null>(null);
    const [showContainer, setShowContainer] = useState(false);
    const { data: messages = [], isLoading } = useThreadMessages(id);

    // Delay hiding the container to allow exit animation
    useEffect(() => {
        if (isOpen) {
            setShowContainer(true);
        } else {
            const timer = setTimeout(() => setShowContainer(false), ARTIFACT_ANIMATION.duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    function handleChatSubmit(message: string) {
        console.log('Chat message submitted:', message);
    }

    if (isLoading && id && id !== 'new') {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col">
            <div className="relative flex w-full flex-1 flex-row overflow-hidden">
                <div
                    className={`flex w-full flex-col pt-4 pb-4 transition-all duration-300 ${isOpen ? 'hidden md:flex md:w-[400px]' : ''} `}
                >
                    <ChatInterface
                        key={id}
                        initialPrompt={initialMessage}
                        initialMessages={messages}
                        onSubmit={handleChatSubmit}
                        projectId={projectId}
                    />
                </div>
                <div
                    ref={setArtifactContainer}
                    className={`relative overflow-hidden ${showContainer ? 'flex-1' : 'hidden'}`}
                />
            </div>
            <Artifact portalContainer={artifactContainer} />
        </div>
    );
}
