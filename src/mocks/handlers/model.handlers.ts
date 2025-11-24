import { delay, http, HttpResponse } from 'msw';
import type { Model } from '@/types';

export const modelHandlers = [
    // GET /models - Return a list of available models.
    http.get('/models', async () => {
        await delay(1000);

        const MOCKED_MODELS: Model[] = [
            {
                id: 'gpt-5-mini',
                name: 'GPT-5 Mini',
                agent: 'Social Agent',
                description: 'Social media advertising campaigns and performance optimization.',
                capabilities: [
                    'Social campaign management',
                    'Audience targeting',
                    'Creative optimization',
                    'Performance analytics',
                ],
                platforms: ['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter'],
                badge: 'new',
                provider: 'openai',
            },
            {
                id: 'claude-opus-4-1',
                name: 'Claude Opus 4.1',
                agent: 'Search Agent',
                description: 'Search engine marketing and paid search campaign management.',
                capabilities: [
                    'Keyword optimization',
                    'Bid management',
                    'Ad copy generation',
                    'Quality score improvement',
                ],
                platforms: ['Google Ads', 'Bing Ads', 'YouTube Ads'],
                badge: 'updated',
                provider: 'anthropic',
            },
            {
                id: 'gemini-2.0-flash-exp',
                name: 'Gemini 2.0 Flash',
                agent: 'Programmatic Agent',
                description: 'Programmatic display and video advertising at scale.',
                capabilities: [
                    'Real-time bidding',
                    'Display campaign automation',
                    'Video ad optimization',
                    'Audience segmentation',
                ],
                platforms: ['Google Display Network', 'DV360', 'Trade Desk', 'Amazon DSP'],
                badge: 'experimental',
                provider: 'google',
            },
            {
                id: 'oai-model',
                name: 'OAI Model',
                agent: 'Warehouse Agent',
                description: 'Data analytics and performance reporting for advertising campaigns.',
                capabilities: [
                    'Cross-channel analytics',
                    'Attribution modeling',
                    'ROI tracking',
                    'Custom reporting',
                ],
                platforms: ['GA4', 'Adobe Analytics', 'Tableau', 'Looker'],
                badge: 'new',
                provider: 'oai',
            },
            {
                id: 'llama-3.1-turbo',
                name: 'Llama 3.1 Turbo',
                agent: 'Experiments Agent',
                description: 'A/B testing and campaign experimentation framework.',
                capabilities: [
                    'Multivariate testing',
                    'Statistical analysis',
                    'Incremental lift studies',
                    'Test design',
                ],
                platforms: ['Google Optimize', 'Optimizely', 'VWO', 'Adobe Target'],
                badge: 'experimental',
                provider: 'meta',
            },
        ];

        return HttpResponse.json({
            models: MOCKED_MODELS,
        });
    }),
];
