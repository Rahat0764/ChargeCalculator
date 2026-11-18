import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import ts from 'typescript';

const isAndroidStorage = process.platform === 'android';
const nodeMajor = Number(process.versions.node.split('.')[0] || '20');

// Pure Node TypeScript/JSX + env define fallback for Android /storage/emulated/0
// (where Go/esbuild cannot run or readdir /storage due to Android FUSE permissions)
function androidTsxPlugin() {
  return {
    name: 'android-tsx-transpile',
    enforce: 'pre',
    transform(code, id) {
      const cleanId = id.split('?')[0];
      let nextCode = code;
      let changed = false;

      if (/\.[cm]?tsx?$/.test(cleanId)) {
        const out = ts.transpileModule(nextCode, {
          fileName: cleanId,
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.ReactJSX,
            sourceMap: false,
          },
        });
        nextCode = out.outputText;
        changed = true;
      }

      if (
        /\.[cm]?[jt]sx?$/.test(cleanId) &&
        (nextCode.includes('process.env.NODE_ENV') || nextCode.includes('import.meta.env'))
      ) {
        const mode = process.env.NODE_ENV === 'test' ? 'test' : 'production';
        nextCode = nextCode
          .replace(/\bprocess\.env\.NODE_ENV\b/g, JSON.stringify(mode))
          .replace(/\bimport\.meta\.env\.MODE\b/g, JSON.stringify(mode))
          .replace(/\bimport\.meta\.env\.PROD\b/g, mode === 'production' ? 'true' : 'false')
          .replace(/\bimport\.meta\.env\.DEV\b/g, mode === 'production' ? 'false' : 'true')
          .replace(/\bimport\.meta\.env\.BASE_URL\b/g, JSON.stringify('/'));
        changed = true;
      }

      return changed ? { code: nextCode, map: null } : null;
    },
  };
}

const pwaPlugin = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: [
    'brands/bkash.svg',
    'brands/nagad.svg',
    'brands/nagad-islamic.svg',
    'brands/rocket.svg',
    'brands/bank.svg',
    'brands/npsb.svg',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-192.svg',
    'icons/icon-512.svg',
  ],
  manifest: {
    name: 'ChargeCalculator — BD MFS & NPSB Fee Calculator',
    short_name: 'ChargeCalc',
    description:
      'বাংলাদেশের বিকাশ, নগদ, নগদ ইসলামিক, এটিএম, সেন্ড মানি ও এনপিএসবি চার্জ ক্যালকুলেটর।',
    theme_color: '#0F172A',
    background_color: '#F8FAFC',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    lang: 'bn',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
    ],
  },
  workbox: {
    mode: isAndroidStorage || nodeMajor >= 24 ? 'development' : 'production',
    disableDevLogs: true,
    sourcemap: false,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
  },
});

export default defineConfig({
  base: '/',
  esbuild: isAndroidStorage ? false : undefined,
  plugins: isAndroidStorage ? [androidTsxPlugin(), pwaPlugin] : [react(), pwaPlugin],
  build: {
    outDir: 'dist',
    target: isAndroidStorage ? false : 'es2020',
    minify: isAndroidStorage ? false : 'esbuild',
    cssMinify: isAndroidStorage ? false : 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
