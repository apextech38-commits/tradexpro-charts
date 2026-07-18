import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    // config.ts (ported from tradexpro-botbuilder) reads process.env.APP_ENV
    // directly — a bare Node global Vite doesn't provide in the browser by
    // default. Shimming it here rather than editing the shared config file,
    // since that file is meant to stay identical across all TradeXpro apps.
    define: {
        'process.env': {},
    },
    plugins: [react()],
    resolve: {
        alias: {
            'Types': path.resolve(__dirname, './src/types'),
            // profithubnewtool's build config (rsbuild.config.ts) aliases this
            // import specifier to @deriv-com/smartcharts-champion — the actual
            // chart engine used at runtime. The plain npm @deriv/deriv-charts
            // package is a different, unrelated codebase; using it directly
            // (as this app did before this fix) causes asset 404s and internal
            // data-shape crashes since it's not the library actually in use.
            '@deriv/deriv-charts': path.resolve(__dirname, './node_modules/@deriv-com/smartcharts-champion'),
            '@/external': path.resolve(__dirname, './src/external'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/utils': path.resolve(__dirname, './src/utils'),
            '@/constants': path.resolve(__dirname, './src/constants'),
            '@/stores': path.resolve(__dirname, './src/stores'),
            '@/types': path.resolve(__dirname, './src/types'),
            '@/pages': path.resolve(__dirname, './src/pages'),
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                loadPaths: [path.resolve(__dirname, './src')],
            },
        },
    },
    build: { outDir: 'dist' },
    server: { port: 5173, host: true },
});
