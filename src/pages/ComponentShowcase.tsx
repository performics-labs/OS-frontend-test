import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_ARTIFACT_RESPONSES } from '@/mocks/data/artifact-responses';
import { useArtifactStore } from '@/stores/artifact-store';
import { Artifact } from '@/components/artifact/Artifact';

export function ComponentShowcase() {
    const { openArtifact } = useArtifactStore();

    const handleTriggerArtifact = (key: string) => {
        const mockArtifact = MOCK_ARTIFACT_RESPONSES[key];
        if (!mockArtifact) return;

        // Convert mock artifact to store artifact format
        openArtifact({
            id: `artifact_${Date.now()}`,
            type: mockArtifact.kind as 'text' | 'code' | 'image' | 'spreadsheet',
            title: mockArtifact.title,
            content: mockArtifact.content,
            language: mockArtifact.language,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    };

    return (
        <div className="bg-background min-h-screen p-8">
            <Artifact />
            <div className="mx-auto max-w-6xl space-y-12">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-foreground text-4xl font-bold tracking-tight">
                            Component Showcase
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Performics brand design system with shadcn/ui components
                        </p>
                    </div>
                </div>

                {/* Buttons Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">Buttons</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Button Variants</CardTitle>
                            <CardDescription>
                                All available button styles with Performics brand colors
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button variant="default">Default (Disrupt)</Button>
                            <Button variant="platform">Platform Green</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Button Sizes</CardTitle>
                            <CardDescription>Default variant in different sizes</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-4">
                            <Button size="sm">Small</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large</Button>
                            <Button size="icon">I</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Disabled State</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button disabled>Disabled Default</Button>
                            <Button variant="platform" disabled>
                                Disabled Platform
                            </Button>
                            <Button variant="outline" disabled>
                                Disabled Outline
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                {/* Badges Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">Badges</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Badge Variants</CardTitle>
                            <CardDescription>Status indicators and labels</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="destructive">Destructive</Badge>
                            <Badge variant="outline">Outline</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="info">Info</Badge>
                            <Badge variant="warning">Warning</Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Badge Use Cases</CardTitle>
                            <CardDescription>
                                Common badge patterns for status and counts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-foreground text-sm">Project Status:</span>
                                <Badge variant="success">Active</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-foreground text-sm">Environment:</span>
                                <Badge variant="info">Beta</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-foreground text-sm">Review Required:</span>
                                <Badge variant="warning">Action Needed</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-foreground text-sm">Build Status:</span>
                                <Badge variant="destructive">Failed</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-foreground text-sm">Notifications:</span>
                                <Badge variant="secondary">12</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Alerts Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">Alerts</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Alert Variants</CardTitle>
                            <CardDescription>
                                Status messages with different semantic meanings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant="default">
                                <AlertTitle>Default Alert</AlertTitle>
                                <AlertDescription>
                                    This is a standard informational message with default styling.
                                </AlertDescription>
                            </Alert>

                            <Alert variant="success">
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>
                                    Your project has been created successfully with Disrupt Green
                                    branding.
                                </AlertDescription>
                            </Alert>

                            <Alert variant="info">
                                <AlertTitle>Information</AlertTitle>
                                <AlertDescription>
                                    This feature is currently in beta. Report issues on GitHub.
                                </AlertDescription>
                            </Alert>

                            <Alert variant="warning">
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    Your session will expire in 5 minutes. Please save your work.
                                </AlertDescription>
                            </Alert>

                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    Failed to upload document. Please check your connection and try
                                    again.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </section>

                {/* Cards and Inputs Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">Cards & Inputs</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Card</CardTitle>
                                <CardDescription>
                                    Cards are containers with subtle borders and shadows
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground text-sm">
                                    Cards use the semantic background token and adapt to light/dark
                                    mode automatically.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Form Example</CardTitle>
                                <CardDescription>Input fields with focus states</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-foreground text-sm font-medium">
                                        Email
                                    </label>
                                    <Input type="email" placeholder="you@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-foreground text-sm font-medium">
                                        Password
                                    </label>
                                    <Input type="password" placeholder="••••••••" />
                                </div>
                                <Button className="w-full">Sign In</Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Form Controls Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">Form Controls</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Dropdown</CardTitle>
                            <CardDescription>
                                Branded select component with Disrupt Green focus
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="w-[280px] space-y-2">
                                <label className="text-foreground text-sm font-medium">
                                    Choose a project
                                </label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="project-1">
                                            Marketing Campaign
                                        </SelectItem>
                                        <SelectItem value="project-2">Brand Redesign</SelectItem>
                                        <SelectItem value="project-3">Website Launch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Checkboxes & Switches</CardTitle>
                            <CardDescription>
                                Toggle controls with Disrupt Green checked states
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="terms" />
                                <label
                                    htmlFor="terms"
                                    className="text-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Accept terms and conditions
                                </label>
                            </div>
                            <Separator />
                            <div className="flex items-center space-x-2">
                                <Switch id="notifications" />
                                <label
                                    htmlFor="notifications"
                                    className="text-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Enable notifications
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Radio Groups</CardTitle>
                            <CardDescription>
                                Radio buttons with Disrupt Green selection
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup defaultValue="option-1">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-1" id="option-1" />
                                    <label
                                        htmlFor="option-1"
                                        className="text-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Weekly reports
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-2" id="option-2" />
                                    <label
                                        htmlFor="option-2"
                                        className="text-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Monthly reports
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-3" id="option-3" />
                                    <label
                                        htmlFor="option-3"
                                        className="text-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Quarterly reports
                                    </label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </section>

                {/* Interactive Components Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">
                        Interactive Components
                    </h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Dialog Modal</CardTitle>
                            <CardDescription>
                                Modal dialog with Disrupt Green actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Open Dialog</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Project</DialogTitle>
                                        <DialogDescription>
                                            Enter project details to get started. This dialog uses
                                            Performics branding.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-foreground text-sm font-medium">
                                                Project Name
                                            </label>
                                            <Input placeholder="My Awesome Project" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost">Cancel</Button>
                                        <Button>Create Project</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dropdown Menu</CardTitle>
                            <CardDescription>
                                Context menu with Platform Green hover states
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Open Menu</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Settings</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Logout</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tooltip</CardTitle>
                            <CardDescription>
                                Hover hint with Disrupt Green background
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline">Hover me</Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>This tooltip uses Performics branding</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardContent>
                    </Card>
                </section>

                {/* Utility Components Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">Utility Components</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Separator</CardTitle>
                            <CardDescription>Visual dividers using border tokens</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-foreground text-sm">Content above separator</p>
                                <Separator className="my-4" />
                                <p className="text-foreground text-sm">Content below separator</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Skeleton</CardTitle>
                            <CardDescription>
                                Loading placeholders with pulse animation
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-3/5" />
                            </div>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Artifact Mocks Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">Artifact Mocks</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Artifact Mocks</CardTitle>
                            <CardDescription>
                                Click the buttons below to preview each artifact mock in the
                                artifact viewer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(MOCK_ARTIFACT_RESPONSES).map(([key, artifact]) => (
                                <div
                                    key={key}
                                    className="border-border space-y-3 rounded-lg border p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className="text-foreground text-lg font-semibold">
                                                    {artifact.title}
                                                </h3>
                                                <Badge variant="outline">
                                                    {artifact.kind}
                                                    {artifact.language && ` / ${artifact.language}`}
                                                </Badge>
                                            </div>
                                            {artifact.description && (
                                                <p className="text-muted-foreground text-sm">
                                                    {artifact.description}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => handleTriggerArtifact(key)}
                                            variant="default"
                                        >
                                            View Artifact
                                        </Button>
                                    </div>

                                    <div className="bg-muted rounded-md p-3">
                                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                                            Example Chat Prompts:
                                        </p>
                                        <div className="space-y-1">
                                            {key === 'button-component' && (
                                                <>
                                                    <p className="text-foreground font-mono text-sm">
                                                        "Create a button component"
                                                    </p>
                                                    <p className="text-foreground font-mono text-sm">
                                                        "Build a button"
                                                    </p>
                                                </>
                                            )}
                                            {key === 'data-table' && (
                                                <>
                                                    <p className="text-foreground font-mono text-sm">
                                                        "Create a data table"
                                                    </p>
                                                    <p className="text-foreground font-mono text-sm">
                                                        "Build a table component"
                                                    </p>
                                                </>
                                            )}
                                            {key === 'markdown-doc' && (
                                                <>
                                                    <p className="text-foreground font-mono text-sm">
                                                        "Write component documentation"
                                                    </p>
                                                    <p className="text-foreground font-mono text-sm">
                                                        "Create a React guide"
                                                    </p>
                                                </>
                                            )}
                                            {key === 'api-hook' && (
                                                <>
                                                    <p className="text-foreground font-mono text-sm">
                                                        "Create an API hook"
                                                    </p>
                                                    <p className="text-foreground font-mono text-sm">
                                                        "Build a custom hook"
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                {/* Color Tokens Section */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-2xl font-semibold">Color Tokens</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Performics Brand Colors</CardTitle>
                            <CardDescription>
                                Semantic tokens mapped to brand colors
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <div className="bg-primary h-20 rounded-md shadow-sm" />
                                <p className="text-foreground text-sm font-medium">
                                    Primary (Disrupt Green)
                                </p>
                                <p className="text-muted-foreground text-xs">#33D76F</p>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-accent h-20 rounded-md shadow-sm" />
                                <p className="text-foreground text-sm font-medium">
                                    Accent (Platform Green)
                                </p>
                                <p className="text-muted-foreground text-xs">#1E9A4B</p>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-destructive h-20 rounded-md shadow-sm" />
                                <p className="text-foreground text-sm font-medium">
                                    Destructive (Alert Red)
                                </p>
                                <p className="text-muted-foreground text-xs">#F25116</p>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-info-500 h-20 rounded-md shadow-sm" />
                                <p className="text-foreground text-sm font-medium">Info (Blue)</p>
                                <p className="text-muted-foreground text-xs">#00C5FF</p>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-warning-500 h-20 rounded-md shadow-sm" />
                                <p className="text-foreground text-sm font-medium">
                                    Warning (Yellow)
                                </p>
                                <p className="text-muted-foreground text-xs">#FFD300</p>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-muted h-20 rounded-md shadow-sm" />
                                <p className="text-foreground text-sm font-medium">
                                    Muted (Light Grey)
                                </p>
                                <p className="text-muted-foreground text-xs">#FAFAFA</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
export default ComponentShowcase;
