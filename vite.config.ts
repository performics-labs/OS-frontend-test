/// <reference types="vitest/config" />

import { defineConfig, loadEnv } from 'vite';
import tsChecker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react-swc';

import path from 'path';

import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        define: {
            // Ensure VITE_API_BASE_URL is always a string, never undefined
            'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
        },
        plugins: [
            react(),
            tailwindcss(),
            tsChecker({
                typescript: {
                    tsconfigPath: 'tsconfig.app.json',
                },
            }),
        ],
        server: {
            port: parseInt(env.VITE_PORT, 10) || 5000,
        },
        test: {
            environment: 'jsdom',
            setupFiles: ['./tests/__setup__/setup.ts'],
            globals: true,
            coverage: {
                provider: 'v8',
                reporter: ['text', 'html', 'lcov', 'json', 'json-summary'],
                reportOnFailure: true,
                thresholds: {
                    lines: 50,
                    functions: 50,
                    branches: 50,
                    statements: 50,
                },
                exclude: [
                    // infra/build
                    'node_modules/',
                    'dist/',
                    'build/',
                    'coverage/',
                    'docs/',
                    // config
                    'vite.config.*',
                    'tailwind.config.*',
                    'postcss.config.*',
                    '*.config.*',
                    // static/assets
                    'public/',
                    '**/*.css',
                    '**/*.scss',
                    '**/*.svg',
                    '**/*.png',
                    '**/*.jpg',
                    // types
                    '**/*.d.ts',
                    '**/types/**',
                    '**/interfaces/**',
                    // test utilities
                    '**/__tests__/**',
                    '**/__mocks__/**',
                    '**/test-utils/**',
                    '**/setupTests.*',
                    // misc
                    'reportWebVitals.*',
                    'serviceWorker.*',
                    'registerServiceWorker.*',
                    // shadcn components
                    'src/components/ui/**',
                ],
            },
        },
        ssr: {
            noExternal: ['katex', 'streamdown'],
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@/components': path.resolve(__dirname, './src/components'),
                '@/contexts': path.resolve(__dirname, './src/contexts'),
                '@/hooks': path.resolve(__dirname, './src/hooks'),
                '@/lib': path.resolve(__dirname, './src/lib'),
                '@/mocks': path.resolve(__dirname, './src/mocks'),
                '@/pages': path.resolve(__dirname, './src/pages'),
                '@/schemas': path.resolve(__dirname, './src/schemas'),
                '@/types': path.resolve(__dirname, './src/types'),
                '@/utils': path.resolve(__dirname, './src/utils'),
                '@tests': path.resolve(__dirname, './tests'),
            },
        },
    };
});
