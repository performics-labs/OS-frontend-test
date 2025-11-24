import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import type { Model } from '@/types';

describe('Model Mock Handlers', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    describe('GET /models', () => {
        it('returns list of available models', async () => {
            const response = await fetch('/models');
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(data.models)).toBe(true);
            expect(data.models.length).toBeGreaterThan(0);

            const model = data.models[0];
            expect(model).toHaveProperty('id');
            expect(model).toHaveProperty('name');
            expect(model).toHaveProperty('description');
            expect(model).toHaveProperty('provider');
        });

        it('includes OAI model in response', async () => {
            const response = await fetch('/models');
            const { models } = await response.json();

            const oai = models.find((m: Model) => m.id === 'oai-model');
            expect(oai).toBeDefined();
            expect(oai.provider).toBe('oai');
        });

        it('handles server error', async () => {
            server.use(
                http.get('/models', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            const response = await fetch('/models');
            expect(response.status).toBe(500);
        });

        it('validates model schema', async () => {
            const response = await fetch('/models');
            const { models } = await response.json();

            models.forEach((model: Model) => {
                expect(model).toMatchObject({
                    id: expect.any(String),
                    name: expect.any(String),
                    description: expect.any(String),
                    provider: expect.any(String),
                });

                if (model.badge) {
                    expect(model.badge).toMatch(/^(new|experimental|updated)$/);
                }
            });
        });
    });
});
