import { lazy, Suspense } from 'react';
import { useArtifact } from '@/hooks/useArtifact';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '@/utils';
import { ARTIFACT_ANIMATION } from '@/constants/artifacts';
import { TextRenderer } from './renders/TextRenderer';

// Lazy load heavy renderers (CodeMirror, DataGrid)
const CodeRenderer = lazy(() => import('./renders/CodeRenderer'));
const ImageRenderer = lazy(() => import('./renders/ImageRenderer'));
const SpreadsheetRenderer = lazy(() => import('./renders/SpreadsheetRenderer'));

const RendererLoader = () => (
    <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
);

/**
 * Main artifact overlay component
 *
 * Renders a side-by-side artifact panel using Radix Dialog with custom portal container.
 * The artifact slides in from the right and takes remaining space after the chat interface.
 * Uses Radix Dialog for focus management and accessibility.
 */
export function Artifact({ portalContainer }: { portalContainer?: HTMLElement | null } = {}) {
    const { artifact, isOpen, closeArtifact } = useArtifact();

    // Animation variants
    const reducedMotion = prefersReducedMotion();

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    // Instant transitions if reduced motion
    const transition = reducedMotion
        ? { duration: 0 }
        : ({
              type: 'spring',
              stiffness: ARTIFACT_ANIMATION.spring.stiffness,
              damping: ARTIFACT_ANIMATION.spring.damping,
          } as const);

    // Update animation variants for side-by-side layout
    const sideContentVariants = {
        hidden: {
            x: '100%',
        },
        visible: {
            x: 0,
        },
        exit: {
            x: '100%',
        },
    };

    return (
        <Dialog.Root modal={false} open={isOpen} onOpenChange={(open) => !open && closeArtifact()}>
            <AnimatePresence>
                {isOpen && artifact && (
                    <Dialog.Portal
                        forceMount
                        {...(portalContainer && { container: portalContainer })}
                    >
                        {/* Background overlay */}
                        <Dialog.Overlay asChild forceMount>
                            <motion.div
                                className="absolute inset-0 bg-black/20"
                                variants={overlayVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={transition}
                            />
                        </Dialog.Overlay>

                        {/* Main content container - slides in from right */}
                        <Dialog.Content
                            asChild
                            forceMount
                            onOpenAutoFocus={(e: Event) => e.preventDefault()}
                            onPointerDownOutside={(e) => e.preventDefault()}
                            onInteractOutside={(e) => e.preventDefault()}
                        >
                            <motion.div
                                className="absolute inset-0 flex h-full w-full focus:outline-none"
                                variants={sideContentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={transition}
                            >
                                {/* Screen reader description for accessibility */}
                                <Dialog.Description className="sr-only">
                                    {artifact?.type === 'code'
                                        ? `Code artifact in ${artifact.language || 'text'} format`
                                        : `${artifact?.type || 'Artifact'} viewer`}
                                </Dialog.Description>

                                {/* Artifact content (full width on mobile, right side on desktop) */}
                                <div className="bg-muted border-light-grey-500 dark:border-warm-black-400 flex min-w-0 flex-1 flex-col md:border-l">
                                    {/* Header with title and close button */}
                                    <div className="flex items-start justify-between p-2">
                                        <div className="flex flex-col">
                                            <Dialog.Title className="truncate font-medium">
                                                {artifact?.title}
                                            </Dialog.Title>
                                            <div className="text-muted-foreground text-sm">
                                                {artifact?.type && `${artifact.type} artifact`}
                                            </div>
                                        </div>
                                        <Dialog.Close asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Close artifact"
                                                className="shrink-0"
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </Dialog.Close>
                                    </div>

                                    {/* Artifact content area */}
                                    <div className="bg-muted h-full w-full min-w-0 overflow-x-auto overflow-y-auto">
                                        {artifact && (
                                            <Suspense fallback={<RendererLoader />}>
                                                {artifact.type === 'text' ? (
                                                    <TextRenderer artifact={artifact} />
                                                ) : artifact.type === 'code' ? (
                                                    <CodeRenderer artifact={artifact} />
                                                ) : artifact.type === 'image' ? (
                                                    <ImageRenderer artifact={artifact} />
                                                ) : artifact.type === 'spreadsheet' ? (
                                                    <SpreadsheetRenderer artifact={artifact} />
                                                ) : (
                                                    <div className="p-4">
                                                        <div className="text-muted-foreground mb-2 text-sm">
                                                            Type:{' '}
                                                            <span className="font-medium">
                                                                {artifact.type}
                                                            </span>
                                                        </div>
                                                        <pre className="bg-muted overflow-auto rounded p-4 text-xs break-words whitespace-pre-wrap">
                                                            {artifact.content}
                                                        </pre>
                                                    </div>
                                                )}
                                            </Suspense>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
