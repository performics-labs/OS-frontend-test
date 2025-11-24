import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolRenderer } from '@/components/ai-elements/tool-renderer';
import type { ToolState } from '@/types/tools';

// Mock data for each tool
const TOOL_EXAMPLES = {
    get_weather: {
        name: 'Weather Tool',
        description: 'Displays current weather, temperature range, and sunrise/sunset times',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { location: 'Dubai' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { location: 'Dubai' },
                output: {
                    latitude: 25.125,
                    longitude: 55.25,
                    timezone: 'Asia/Dubai',
                    generationtime_ms: 0.06,
                    utc_offset_seconds: 14400,
                    timezone_abbreviation: 'GST',
                    elevation: 5,
                    current: {
                        time: '2024-01-15T14:00',
                        temperature_2m: 28.5,
                    },
                    current_units: {
                        temperature_2m: '°C',
                    },
                    hourly: {
                        temperature_2m: [
                            22, 21, 20, 19, 19, 20, 21, 23, 25, 27, 29, 30, 31, 32, 32, 31, 30, 29,
                            27, 25, 24, 23, 22, 21,
                        ],
                    },
                    daily: {
                        sunrise: ['2024-01-15T06:55:00'],
                        sunset: ['2024-01-15T18:10:00'],
                    },
                    cityName: 'Dubai, United Arab Emirates',
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { location: 'InvalidCity123' },
                output: undefined,
                error: 'Location not found. Please provide a valid city name.',
            },
        },
    },
    calculator: {
        name: 'Calculator Tool',
        description: 'Performs mathematical calculations and returns results',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { expression: '(125 * 8) + 450' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { expression: '(125 * 8) + 450' },
                output: {
                    expression: '(125 * 8) + 450',
                    result: 1450,
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { expression: '10 / 0' },
                output: undefined,
                error: 'Division by zero is not allowed',
            },
        },
    },
    self_reflective_rag: {
        name: 'Self-Reflective RAG Tool',
        description: 'Searches knowledge base with self-reflection and retrieval augmentation',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { query: 'What are the key benefits of performance marketing?' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { query: 'What are the key benefits of performance marketing?' },
                output: {
                    query: 'What are the key benefits of performance marketing?',
                    results: [
                        {
                            content:
                                'Performance marketing offers measurable ROI, real-time optimization, and cost-effective customer acquisition...',
                            relevance: 0.92,
                            source: 'marketing-strategy.pdf',
                        },
                        {
                            content:
                                'Key advantages include data-driven decision making, precise audience targeting, and flexible budget allocation...',
                            relevance: 0.88,
                            source: 'digital-advertising-guide.pdf',
                        },
                    ],
                    reflections: [
                        'Query is well-formed and specific',
                        'Found highly relevant documents in knowledge base',
                    ],
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { query: '' },
                output: undefined,
                error: 'Query cannot be empty',
            },
        },
    },
    brightdata_search_engine: {
        name: 'BrightData Search Engine',
        description: 'Searches the web using BrightData API for real-time information',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { query: 'latest AI trends 2025' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { query: 'latest AI trends 2025' },
                output: {
                    query: 'latest AI trends 2025',
                    results: [
                        {
                            title: 'Top AI Trends for 2025: What to Expect',
                            url: 'https://example.com/ai-trends-2025',
                            snippet:
                                'Generative AI continues to evolve with multimodal models, improved efficiency, and enterprise adoption accelerating...',
                        },
                        {
                            title: '2025 AI Predictions: Industry Expert Insights',
                            url: 'https://example.com/ai-predictions',
                            snippet:
                                'AI agents, edge computing integration, and responsible AI governance are emerging as key focus areas...',
                        },
                        {
                            title: 'AI in Marketing: 2025 Forecast',
                            url: 'https://example.com/ai-marketing',
                            snippet:
                                'Personalization at scale, predictive analytics, and automated content generation dominate marketing AI applications...',
                        },
                    ],
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { query: 'test query' },
                output: undefined,
                error: 'API rate limit exceeded. Please try again later.',
            },
        },
    },
    createArtifact: {
        name: 'Create Artifact Tool',
        description: 'Creates and displays artifacts (text, code, images, spreadsheets)',
        states: {
            loading: {
                state: 'input-available' as ToolState,
                input: { title: 'React Component', kind: 'code' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { title: 'React Button Component', kind: 'code' },
                output: {
                    id: 'artifact-123',
                    title: 'React Button Component',
                    kind: 'code',
                    language: 'tsx',
                    content: `import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-md font-medium transition-colors',
          {
            'bg-primary text-white hover:bg-primary/90': variant === 'default',
            'border border-gray-300 hover:bg-gray-50': variant === 'outline',
            'hover:bg-gray-100': variant === 'ghost',
          },
          {
            'px-2 py-1 text-sm': size === 'sm',
            'px-4 py-2': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';`,
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { title: 'Invalid Artifact', kind: 'code' },
                output: undefined,
                error: 'Failed to generate artifact content',
            },
        },
    },
    client_profiler: {
        name: 'Client Profiler',
        description: 'Analyzes client profile with industry benchmarks and competitive insights',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { clientName: 'Nike', objective: 'Brand Awareness' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { clientName: 'Nike', objective: 'Brand Awareness' },
                output: {
                    clientProfile: {
                        id: 'client-nike-001',
                        name: 'Nike',
                        industry: 'Athletic Apparel',
                        historicalPerformance: {
                            totalCampaigns: 45,
                            avgBudget: 500000,
                            avgROAS: 4.2,
                            topPerformingPlatforms: ['Meta', 'Google', 'TikTok'],
                            bestObjectives: ['Brand Awareness', 'Conversions', 'Engagement']
                        }
                    },
                    industryBenchmarks: {
                        avgBudget: 450000,
                        avgCampaignDuration: 45,
                        topPlatforms: [
                            { platform: 'Meta', marketShare: 35 },
                            { platform: 'Google', marketShare: 30 },
                            { platform: 'Instagram', marketShare: 20 }
                        ],
                        seasonalTrends: [
                            { month: 'January', performanceIndex: 85 },
                            { month: 'February', performanceIndex: 90 },
                            { month: 'March', performanceIndex: 95 },
                            { month: 'April', performanceIndex: 100 },
                            { month: 'November', performanceIndex: 110 },
                            { month: 'December', performanceIndex: 125 }
                        ]
                    },
                    competitiveInsights: {
                        competitorSpend: 800000,
                        competitorPlatforms: ['Meta', 'Google', 'YouTube', 'TikTok'],
                        marketGaps: ['Gen Z engagement on TikTok', 'Influencer partnerships', 'User-generated content'],
                        opportunities: ['Short-form video content', 'Athlete collaborations', 'Sustainability messaging']
                    },
                    recommendations: {
                        suggestedBudgetRange: { min: 400000, optimal: 550000, max: 750000 },
                        suggestedDuration: 60,
                        suggestedPlatforms: ['Meta', 'TikTok', 'YouTube']
                    },
                    objective: 'Brand Awareness'
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { clientName: '', objective: '' },
                output: undefined,
                error: 'Invalid client profile parameters',
            },
        },
    },
    budget_allocator: {
        name: 'Budget Allocator',
        description: 'Allocates budget across platforms and campaign phases',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { totalBudget: 200000, platforms: ['Meta', 'Google', 'TikTok'], duration: 60 },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { totalBudget: 200000, platforms: ['Meta', 'Google', 'TikTok'], duration: 60 },
                output: {
                    platformAllocations: [
                        { platform: 'Meta', budget: 90000, percentage: 45, dailyBudget: 1500 },
                        { platform: 'Google', budget: 60000, percentage: 30, dailyBudget: 1000 },
                        { platform: 'TikTok', budget: 50000, percentage: 25, dailyBudget: 833 }
                    ],
                    phaseAllocations: [
                        { phase: 'Launch', budget: 60000, days: 15 },
                        { phase: 'Sustain', budget: 80000, days: 30 },
                        { phase: 'Optimize', budget: 60000, days: 15 }
                    ],
                    reserveBudget: 20000
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { totalBudget: 0, platforms: [], duration: 0 },
                output: undefined,
                error: 'Invalid budget allocation parameters',
            },
        },
    },
    roas_projector: {
        name: 'ROAS Projector',
        description: 'Projects return on ad spend with revenue forecasts',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { budget: 150000, platforms: ['Meta', 'Google'], duration: 45 },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { budget: 150000, platforms: ['Meta', 'Google'], duration: 45 },
                output: {
                    projections: [
                        { platform: 'Meta', expectedROAS: 4.2, minROAS: 3.8, maxROAS: 4.8, expectedRevenue: 315000, expectedConversions: 7875, conversionRate: 3.1, avgOrderValue: 40.00 },
                        { platform: 'Google', expectedROAS: 3.9, minROAS: 3.5, maxROAS: 4.3, expectedRevenue: 292500, expectedConversions: 4500, conversionRate: 2.4, avgOrderValue: 65.00 }
                    ],
                    weeklyProjections: [
                        { week: 1, spend: 15000, revenue: 52500, roas: 3.5 },
                        { week: 2, spend: 15000, revenue: 57000, roas: 3.8 },
                        { week: 3, spend: 15000, revenue: 60000, roas: 4.0 },
                        { week: 4, spend: 15000, revenue: 63750, roas: 4.25 }
                    ],
                    confidenceScore: 89
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { budget: 0, platforms: [], duration: 0 },
                output: undefined,
                error: 'Invalid ROAS projection parameters',
            },
        },
    },
    pricing_optimizer: {
        name: 'Pricing Optimizer',
        description: 'Optimizes bid strategies and pricing across platforms',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { platforms: ['Meta', 'Google'], budget: 75000, objective: 'Conversions' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { platforms: ['Meta', 'Google'], budget: 75000, objective: 'Conversions' },
                output: {
                    pricingStrategy: {
                        avgCPM: 14.50,
                        avgCPC: 0.85,
                        avgCPA: 28.50,
                        bidMultipliers: {
                            time: [
                                { hour: 0, multiplier: 0.7 },
                                { hour: 6, multiplier: 0.85 },
                                { hour: 9, multiplier: 1.1 },
                                { hour: 12, multiplier: 1.0 },
                                { hour: 17, multiplier: 1.25 },
                                { hour: 21, multiplier: 1.15 },
                            ],
                            device: [
                                { device: 'Mobile', multiplier: 1.15 },
                                { device: 'Desktop', multiplier: 0.95 },
                                { device: 'Tablet', multiplier: 0.90 },
                            ],
                            geography: [
                                { location: 'Urban', multiplier: 1.20 },
                                { location: 'Suburban', multiplier: 1.0 },
                                { location: 'Rural', multiplier: 0.85 },
                            ],
                        },
                        recommendedBudgetPacing: 'Accelerated during peak hours (9am-9pm)',
                    },
                    platformPricing: [
                        { platform: 'Meta', cpm: 12.50, cpc: 0.75, cpa: 25.00, competitiveness: 'High' },
                        { platform: 'Google', cpm: 18.75, cpc: 1.20, cpa: 35.00, competitiveness: 'Very High' },
                    ]
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { platforms: [], budget: 0, objective: '' },
                output: undefined,
                error: 'Invalid pricing parameters',
            },
        },
    },
    brand_lift_predictor: {
        name: 'Brand Lift Predictor',
        description: 'Predicts brand awareness and consideration lift metrics',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { platforms: ['Meta', 'YouTube'], budget: 200000, duration: 60, objective: 'Brand Awareness' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { platforms: ['Meta', 'YouTube'], budget: 200000, duration: 60, objective: 'Brand Awareness' },
                output: {
                    brandLiftMetrics: {
                        awarenessLift: 18.5,
                        considerationLift: 12.3,
                        preferenceShift: 9.8,
                        purchaseIntent: 7.2,
                        brandRecall: 15.6,
                        adRecall: 13.4
                    },
                    sentimentAnalysis: {
                        positive: 68,
                        neutral: 25,
                        negative: 7,
                        topics: [
                            { topic: 'Product Quality', score: 85 },
                            { topic: 'Brand Values', score: 78 },
                            { topic: 'Innovation', score: 82 },
                            { topic: 'Customer Service', score: 72 }
                        ]
                    },
                    projectedTimeline: [
                        { week: 1, awareness: 5, consideration: 3, intent: 2 },
                        { week: 2, awareness: 8, consideration: 5, intent: 3 },
                        { week: 3, awareness: 12, consideration: 8, intent: 5 },
                        { week: 4, awareness: 15, consideration: 11, intent: 7 },
                        { week: 6, awareness: 18, consideration: 13, intent: 9 },
                        { week: 8, awareness: 19, consideration: 14, intent: 10 }
                    ]
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { platforms: [], budget: 0, duration: 0, objective: '' },
                output: undefined,
                error: 'Invalid brand lift parameters',
            },
        },
    },
    audience_creator: {
        name: 'Audience Creator',
        description: 'Creates targeted audience segments with reach estimates',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { targetAudience: 'Tech professionals', platforms: ['LinkedIn', 'Twitter'], objective: 'Lead Generation' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { targetAudience: 'Tech professionals', platforms: ['LinkedIn', 'Twitter'], objective: 'Lead Generation' },
                output: {
                    segments: [
                        {
                            name: 'Senior Tech Leaders',
                            size: 850000,
                            characteristics: {
                                ageRange: '35-54',
                                gender: 'All',
                                interests: ['Cloud Computing', 'AI/ML', 'Enterprise Software'],
                                income: '$100k-$200k+',
                                location: ['United States', 'Canada', 'United Kingdom']
                            },
                            platforms: ['LinkedIn', 'Twitter'],
                            estimatedReach: 650000,
                            engagementScore: 8.5
                        },
                        {
                            name: 'Mid-Level Engineers',
                            size: 1200000,
                            characteristics: {
                                ageRange: '25-44',
                                gender: 'All',
                                interests: ['Programming', 'DevOps', 'Open Source'],
                                income: '$75k-$150k',
                                location: ['United States', 'Canada', 'Germany', 'France']
                            },
                            platforms: ['LinkedIn', 'Twitter'],
                            estimatedReach: 920000,
                            engagementScore: 7.8
                        },
                        {
                            name: 'Tech Enthusiasts',
                            size: 2100000,
                            characteristics: {
                                ageRange: '22-40',
                                gender: 'All',
                                interests: ['Technology News', 'Startups', 'Innovation'],
                                income: '$50k-$120k',
                                location: ['Global']
                            },
                            platforms: ['LinkedIn', 'Twitter'],
                            estimatedReach: 1580000,
                            engagementScore: 7.2
                        }
                    ],
                    totalReach: 3150000,
                    overlapAnalysis: {
                        hasOverlap: true,
                        overlapPercentage: 12.5,
                        recommendation: 'Consider frequency capping to avoid oversaturation. Some users appear in multiple segments.'
                    }
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { targetAudience: '', platforms: [], objective: '' },
                output: undefined,
                error: 'Invalid audience parameters',
            },
        },
    },
    creative_designer: {
        name: 'Creative Designer',
        description: 'Generates creative recommendations and asset specifications',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { platforms: ['Meta', 'Instagram'], objective: 'Engagement', brand: 'Nike' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { platforms: ['Meta', 'Instagram'], objective: 'Engagement', brand: 'Nike' },
                output: {
                    creativeAssets: [
                        {
                            format: 'Feed Image',
                            dimensions: '1080x1080',
                            platform: 'Meta',
                            theme: 'Bold & Vibrant',
                            keyElements: ['Headline', 'Product Shot', 'Logo', 'CTA Button'],
                            copyVariants: ['Just Do It - Your Way', 'Unleash Your Potential', 'Performance Meets Style'],
                            estimatedCTR: 3.8
                        },
                        {
                            format: 'Feed Video',
                            dimensions: '1080x1080',
                            platform: 'Meta',
                            theme: 'Lifestyle',
                            keyElements: ['Hook', 'Story Arc', 'Product Demo', 'Call to Action'],
                            copyVariants: ['Transform Your Game', 'Athletes Choose Nike', 'Innovation in Motion'],
                            estimatedCTR: 5.2
                        },
                        {
                            format: 'Stories',
                            dimensions: '1080x1920',
                            platform: 'Instagram',
                            theme: 'User-generated',
                            keyElements: ['Vertical Video', 'Text Overlay', 'Sticker', 'Swipe Up'],
                            copyVariants: ['See What Athletes Say', 'Real Performance', 'Join the Movement'],
                            estimatedCTR: 4.5
                        },
                        {
                            format: 'Reels',
                            dimensions: '1080x1920',
                            platform: 'Instagram',
                            theme: 'Product-focused',
                            keyElements: ['Fast Cuts', 'Music', 'Product Features', 'Hashtags'],
                            copyVariants: ['New Drop Alert', 'Tech That Performs', 'Style Meets Function'],
                            estimatedCTR: 6.1
                        }
                    ],
                    brandGuidelines: {
                        primaryColors: ['#000000', '#FFFFFF', '#FF6B00'],
                        fonts: ['Nike Futura', 'Helvetica Neue Bold', 'Arial'],
                        tone: 'Inspirational, empowering, and action-oriented',
                        visualStyle: 'High-energy, athlete-focused, minimalist with bold contrasts'
                    }
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { platforms: [], objective: '', brand: '' },
                output: undefined,
                error: 'Invalid creative parameters',
            },
        },
    },
    platform_configurator: {
        name: 'Platform Configurator',
        description: 'Configures platform-specific settings and targeting options',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { platforms: ['Meta', 'Google', 'LinkedIn'], targetAudience: 'Business professionals', objective: 'Lead Generation' },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { platforms: ['Meta', 'Google', 'LinkedIn'], targetAudience: 'Business professionals', objective: 'Lead Generation' },
                output: {
                    configurations: [
                        {
                            platform: 'Meta',
                            targetingOptions: {
                                demographics: ['25-34', '35-44', '45-54'],
                                interests: ['Business', 'Technology', 'Professional Development', 'Entrepreneurship'],
                                behaviors: ['Online Shoppers', 'Early Adopters', 'Premium Brand Affinity']
                            },
                            adFormats: ['Image', 'Video', 'Carousel'],
                            placementTypes: ['Feed', 'Stories'],
                            bidStrategy: 'CPA',
                            optimizationGoal: 'Lead Generation'
                        },
                        {
                            platform: 'Google',
                            targetingOptions: {
                                demographics: ['35-44', '45-54', '55+'],
                                interests: ['Business', 'Technology', 'Finance', 'Professional Services'],
                                behaviors: ['Business Decision Makers', 'B2B Buyers', 'High Net Worth']
                            },
                            adFormats: ['Search', 'Display', 'Video'],
                            placementTypes: ['Search', 'Discovery'],
                            bidStrategy: 'Target ROAS',
                            optimizationGoal: 'Lead Generation'
                        },
                        {
                            platform: 'LinkedIn',
                            targetingOptions: {
                                demographics: ['25-34', '35-44', '45-54'],
                                interests: ['Business', 'Technology', 'Leadership', 'Professional Development'],
                                behaviors: ['Business Decision Makers', 'Thought Leaders', 'Active Job Seekers']
                            },
                            adFormats: ['Sponsored Content', 'Message Ads', 'Dynamic Ads'],
                            placementTypes: ['Feed', 'Reels'],
                            bidStrategy: 'CPC',
                            optimizationGoal: 'Lead Generation'
                        }
                    ]
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { platforms: [], targetAudience: '', objective: '' },
                output: undefined,
                error: 'Invalid configuration parameters',
            },
        },
    },
    export_generator: {
        name: 'Export Generator',
        description: 'Generates exportable campaign summaries and documents',
        states: {
            loading: {
                state: 'input-streaming' as ToolState,
                input: { clientName: 'Acme Corp', campaignData: { budget: 150000, platforms: ['Meta', 'Google'], duration: 45 } },
                output: undefined,
                error: undefined,
            },
            success: {
                state: 'output-available' as ToolState,
                input: { clientName: 'Acme Corp', campaignData: { budget: 150000, platforms: ['Meta', 'Google'], duration: 45 } },
                output: {
                    campaignSummary: {
                        campaignName: 'Acme Corp Campaign',
                        totalBudget: 150000,
                        duration: 45,
                        platforms: ['Meta', 'Google', 'TikTok', 'LinkedIn'],
                        expectedROAS: 3.8,
                        expectedReach: 2750000
                    },
                    formats: [
                        { type: 'pdf', name: 'Campaign Strategy.pdf', size: '2.4 MB', ready: true },
                        { type: 'excel', name: 'Budget Allocation.xlsx', size: '1.1 MB', ready: true },
                        { type: 'csv', name: 'Audience Data.csv', size: '845 KB', ready: true },
                        { type: 'powerpoint', name: 'Executive Presentation.pptx', size: '5.2 MB', ready: false },
                        { type: 'json', name: 'Campaign Config.json', size: '124 KB', ready: true }
                    ],
                    shareableLinks: {
                        presentationUrl: 'https://slides.example.com/campaign-12345678',
                        dataStudioUrl: 'https://datastudio.example.com/report-12345678',
                        collaborationUrl: 'https://workspace.example.com/campaign-12345678'
                    },
                    completionStatus: {
                        dataCompiled: true,
                        visualsGenerated: true,
                        documentsReady: true,
                        sharingEnabled: true
                    }
                },
                error: undefined,
            },
            error: {
                state: 'output-error' as ToolState,
                input: { clientName: '', campaignData: {} },
                output: undefined,
                error: 'Invalid export parameters',
            },
        },
    },
};

type ToolName = keyof typeof TOOL_EXAMPLES;
type StateName = 'loading' | 'success' | 'error';

export function ToolsShowcasePage() {
    const [selectedTool, setSelectedTool] = useState<ToolName>('get_weather');
    const [selectedState, setSelectedState] = useState<StateName>('success');

    const toolExample = TOOL_EXAMPLES[selectedTool];
    const stateData = toolExample.states[selectedState];

    return (
        <div className="container mx-auto max-w-6xl space-y-6 p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Tool Cards Showcase</h1>
                <p className="text-muted-foreground">
                    Preview how custom tool cards render with different states and data
                </p>
            </div>

            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Controls</CardTitle>
                    <CardDescription>Select a tool and state to preview</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Tool</label>
                        <Select
                            value={selectedTool}
                            onValueChange={(v) => setSelectedTool(v as ToolName)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(TOOL_EXAMPLES).map(([key, tool]) => (
                                    <SelectItem key={key} value={key}>
                                        {tool.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">State</label>
                        <Select
                            value={selectedState}
                            onValueChange={(v) => setSelectedState(v as StateName)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="loading">Loading</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Two-column layout for Tool Info and Preview */}
            <div className="grid grid-cols-2 gap-6">
                {/* Tool Info */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{toolExample.name}</CardTitle>
                        <CardDescription>{toolExample.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Tool Name:</span>{' '}
                                <code className="bg-muted rounded px-1.5 py-0.5">
                                    {selectedTool}
                                </code>
                            </div>
                            <div>
                                <span className="text-muted-foreground">State:</span>{' '}
                                <code className="bg-muted rounded px-1.5 py-0.5">
                                    {stateData.state}
                                </code>
                            </div>
                        </div>

                        {stateData.input && (
                            <div>
                                <p className="text-muted-foreground mb-1 text-sm">Input:</p>
                                <pre className="bg-muted overflow-x-auto rounded p-2 text-xs">
                                    {JSON.stringify(stateData.input, null, 2)}
                                </pre>
                            </div>
                        )}

                        {stateData.output && (
                            <div>
                                <p className="text-muted-foreground mb-1 text-sm">Output:</p>
                                <pre className="bg-muted max-h-60 overflow-auto rounded p-2 text-xs">
                                    {JSON.stringify(stateData.output, null, 2)}
                                </pre>
                            </div>
                        )}

                        {stateData.error && (
                            <div>
                                <p className="text-muted-foreground mb-1 text-sm">Error:</p>
                                <p className="text-destructive text-sm">{stateData.error}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tool Card Preview */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>How the tool card will appear in chat</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-muted/50 flex flex-1 items-center justify-center p-8">
                        <ToolRenderer
                            toolName={selectedTool}
                            state={stateData.state}
                            input={stateData.input}
                            output={stateData.output}
                            error={stateData.error}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
export default ToolsShowcasePage;
