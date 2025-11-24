import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Send, Square, X, Paperclip, Check } from 'lucide-react';
import { ModelSelector } from '@/components/ModelSelector';

export function DesignSystemPage() {
    return (
        <PageContainer className="py-8">
            <div className="mx-auto max-w-6xl space-y-12">
                <div>
                    <h1 className="mb-2 text-4xl font-bold">Design System</h1>
                    <p className="text-muted-foreground">
                        All design elements and components used in OneSuite
                    </p>
                </div>

                {/* Colors */}
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Colors</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <div className="bg-background mb-2 h-20 rounded-lg border"></div>
                            <p className="text-sm font-medium">Background</p>
                            <p className="text-muted-foreground text-xs">bg-background</p>
                        </div>
                        <div>
                            <div className="bg-foreground mb-2 h-20 rounded-lg"></div>
                            <p className="text-sm font-medium">Foreground</p>
                            <p className="text-muted-foreground text-xs">bg-foreground</p>
                        </div>
                        <div>
                            <div className="bg-primary mb-2 h-20 rounded-lg"></div>
                            <p className="text-sm font-medium">Primary</p>
                            <p className="text-muted-foreground text-xs">bg-primary</p>
                        </div>
                        <div>
                            <div className="bg-secondary mb-2 h-20 rounded-lg"></div>
                            <p className="text-sm font-medium">Secondary</p>
                            <p className="text-muted-foreground text-xs">bg-secondary</p>
                        </div>
                        <div>
                            <div className="bg-muted mb-2 h-20 rounded-lg"></div>
                            <p className="text-sm font-medium">Muted</p>
                            <p className="text-muted-foreground text-xs">bg-muted</p>
                        </div>
                        <div>
                            <div className="bg-muted-light mb-2 h-20 rounded-lg border"></div>
                            <p className="text-sm font-medium">Muted Light</p>
                            <p className="text-muted-foreground text-xs">bg-muted-light</p>
                        </div>
                        <div>
                            <div className="bg-accent mb-2 h-20 rounded-lg"></div>
                            <p className="text-sm font-medium">Accent</p>
                            <p className="text-muted-foreground text-xs">bg-accent</p>
                        </div>
                        <div>
                            <div className="bg-destructive mb-2 h-20 rounded-lg"></div>
                            <p className="text-sm font-medium">Destructive</p>
                            <p className="text-muted-foreground text-xs">bg-destructive</p>
                        </div>
                        <div>
                            <div className="border-border mb-2 h-20 rounded-lg border"></div>
                            <p className="text-sm font-medium">Border</p>
                            <p className="text-muted-foreground text-xs">border-border</p>
                        </div>
                    </div>
                </section>

                {/* Font Options */}
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Font Options</h2>
                    <p className="text-muted-foreground mb-6 text-sm">
                        Currently using: <span className="font-semibold">Geist</span> (Vercel's
                        modern font)
                    </p>
                    <div className="space-y-6">
                        {/* Inter */}
                        <div className="border-border rounded-lg border p-6">
                            <div style={{ fontFamily: 'Inter, sans-serif' }} className="space-y-2">
                                <h3 className="text-xl font-semibold">Inter</h3>
                                <p className="text-muted-foreground text-sm">
                                    Modern, geometric sans-serif optimized for UI
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-3xl font-light">
                                        What are we optimizing today?
                                    </p>
                                    <p className="text-base">
                                        The quick brown fox jumps over the lazy dog
                                    </p>
                                    <p className="text-sm">0123456789 !@#$%</p>
                                </div>
                            </div>
                        </div>

                        {/* Geist */}
                        <div className="border-primary bg-primary/5 rounded-lg border-2 p-6">
                            <div style={{ fontFamily: 'Geist, sans-serif' }} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-semibold">Geist</h3>
                                    <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                                        Active
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Vercel's modern font, clean and professional
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-3xl font-light">
                                        What are we optimizing today?
                                    </p>
                                    <p className="text-base">
                                        The quick brown fox jumps over the lazy dog
                                    </p>
                                    <p className="text-sm">0123456789 !@#$%</p>
                                </div>
                            </div>
                        </div>

                        {/* IBM Plex Sans */}
                        <div className="border-border rounded-lg border p-6">
                            <div
                                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                                className="space-y-2"
                            >
                                <h3 className="text-xl font-semibold">IBM Plex Sans</h3>
                                <p className="text-muted-foreground text-sm">
                                    Professional and readable, excellent for data
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-3xl font-light">
                                        What are we optimizing today?
                                    </p>
                                    <p className="text-base">
                                        The quick brown fox jumps over the lazy dog
                                    </p>
                                    <p className="text-sm">0123456789 !@#$%</p>
                                </div>
                            </div>
                        </div>

                        {/* Work Sans */}
                        <div className="border-border rounded-lg border p-6">
                            <div
                                style={{ fontFamily: "'Work Sans', sans-serif" }}
                                className="space-y-2"
                            >
                                <h3 className="text-xl font-semibold">Work Sans</h3>
                                <p className="text-muted-foreground text-sm">
                                    Friendly and approachable, great for headings
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-3xl font-light">
                                        What are we optimizing today?
                                    </p>
                                    <p className="text-base">
                                        The quick brown fox jumps over the lazy dog
                                    </p>
                                    <p className="text-sm">0123456789 !@#$%</p>
                                </div>
                            </div>
                        </div>

                        {/* DM Sans */}
                        <div className="border-border rounded-lg border p-6">
                            <div
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                                className="space-y-2"
                            >
                                <h3 className="text-xl font-semibold">DM Sans</h3>
                                <p className="text-muted-foreground text-sm">
                                    Low-contrast, highly legible at small sizes
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-3xl font-light">
                                        What are we optimizing today?
                                    </p>
                                    <p className="text-base">
                                        The quick brown fox jumps over the lazy dog
                                    </p>
                                    <p className="text-sm">0123456789 !@#$%</p>
                                </div>
                            </div>
                        </div>

                        {/* System Font Stack */}
                        <div className="border-border rounded-lg border p-6">
                            <div
                                style={{
                                    fontFamily:
                                        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                }}
                                className="space-y-2"
                            >
                                <h3 className="text-xl font-semibold">System Font Stack</h3>
                                <p className="text-muted-foreground text-sm">
                                    Native fonts (San Francisco, Segoe UI, Roboto) - fast and
                                    familiar
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-3xl font-light">
                                        What are we optimizing today?
                                    </p>
                                    <p className="text-base">
                                        The quick brown fox jumps over the lazy dog
                                    </p>
                                    <p className="text-sm">0123456789 !@#$%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Typography */}
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Typography</h2>
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-6xl font-light">Heading 1 - Light</h1>
                            <p className="text-muted-foreground text-sm">text-6xl font-light</p>
                        </div>
                        <div>
                            <h2 className="text-5xl font-light">Heading 2 - Light</h2>
                            <p className="text-muted-foreground text-sm">text-5xl font-light</p>
                        </div>
                        <div>
                            <h3 className="text-4xl font-semibold">Heading 3 - Semibold</h3>
                            <p className="text-muted-foreground text-sm">text-4xl font-semibold</p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold">Heading 4 - Semibold</h4>
                            <p className="text-muted-foreground text-sm">text-2xl font-semibold</p>
                        </div>
                        <div>
                            <p className="text-base">Body text - Regular</p>
                            <p className="text-muted-foreground text-sm">text-base</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">
                                Small text - Muted foreground
                            </p>
                            <p className="text-muted-foreground text-sm">
                                text-sm text-muted-foreground
                            </p>
                        </div>
                    </div>
                </section>

                {/* Buttons */}
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Buttons</h2>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Button variant="default">Default</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button size="default">Default Size</Button>
                            <Button size="sm">Small</Button>
                            <Button size="lg">Large</Button>
                            <Button size="icon">
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button disabled>Disabled</Button>
                            <Button variant="outline" disabled>
                                Disabled Outline
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Icons */}
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Icons (Lucide)</h2>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg border p-4">
                                <Send className="h-6 w-6" />
                            </div>
                            <p className="text-sm">Send</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg border p-4">
                                <Square className="h-6 w-6" />
                            </div>
                            <p className="text-sm">Square</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg border p-4">
                                <X className="h-6 w-6" />
                            </div>
                            <p className="text-sm">X</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg border p-4">
                                <Paperclip className="h-6 w-6" />
                            </div>
                            <p className="text-sm">Paperclip</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg border p-4">
                                <Check className="h-6 w-6" />
                            </div>
                            <p className="text-sm">Check</p>
                        </div>
                    </div>
                </section>

                {/* Components */}
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Components</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="mb-2 text-lg font-medium">Model Selector</h3>
                            <div className="flex items-center gap-2">
                                <ModelSelector disabled={false} />
                                <span className="text-muted-foreground text-sm">
                                    (Active State)
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-2 text-lg font-medium">Model Selector (Disabled)</h3>
                            <div className="flex items-center gap-2">
                                <ModelSelector disabled={true} />
                                <span className="text-muted-foreground text-sm">
                                    (Disabled State)
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Spacing */}
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Spacing</h2>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-20 text-sm">0.5rem</div>
                            <div className="bg-primary h-8" style={{ width: '0.5rem' }}></div>
                            <span className="text-muted-foreground text-sm">gap-2, p-2, m-2</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-20 text-sm">0.75rem</div>
                            <div className="bg-primary h-8" style={{ width: '0.75rem' }}></div>
                            <span className="text-muted-foreground text-sm">gap-3, p-3, m-3</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-20 text-sm">1rem</div>
                            <div className="bg-primary h-8" style={{ width: '1rem' }}></div>
                            <span className="text-muted-foreground text-sm">gap-4, p-4, m-4</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-20 text-sm">2rem</div>
                            <div className="bg-primary h-8" style={{ width: '2rem' }}></div>
                            <span className="text-muted-foreground text-sm">gap-8, p-8, m-8</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-20 text-sm">2.5rem</div>
                            <div className="bg-primary h-8" style={{ width: '2.5rem' }}></div>
                            <span className="text-muted-foreground text-sm">
                                gap-10, p-10, m-10
                            </span>
                        </div>
                    </div>
                </section>

                {/* Border Radius */}
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Border Radius</h2>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-primary h-20 w-20 rounded-sm"></div>
                            <p className="text-sm">Small</p>
                            <p className="text-muted-foreground text-xs">rounded-sm</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-primary h-20 w-20 rounded"></div>
                            <p className="text-sm">Default</p>
                            <p className="text-muted-foreground text-xs">rounded</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-primary h-20 w-20 rounded-md"></div>
                            <p className="text-sm">Medium</p>
                            <p className="text-muted-foreground text-xs">rounded-md</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-primary h-20 w-20 rounded-lg"></div>
                            <p className="text-sm">Large</p>
                            <p className="text-muted-foreground text-xs">rounded-lg</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-primary h-20 w-20 rounded-xl"></div>
                            <p className="text-sm">XL</p>
                            <p className="text-muted-foreground text-xs">rounded-xl</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-primary h-20 w-20 rounded-full"></div>
                            <p className="text-sm">Full</p>
                            <p className="text-muted-foreground text-xs">rounded-full</p>
                        </div>
                    </div>
                </section>
            </div>
        </PageContainer>
    );
}
export default DesignSystemPage;
