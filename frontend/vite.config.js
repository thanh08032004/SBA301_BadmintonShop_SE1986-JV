import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { createApiHandler } from './mock/server.mjs';

// Serves the mock API on the Vite server, so `npm run dev` is enough while the backend is not ready.
function mockApi() {
  const handler = createApiHandler();
  const install = (server) => {
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/api/')) return handler(req, res);
      next();
    });
  };
  return { name: 'mock-api', configureServer: install, configurePreviewServer: install };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useMock = env.VITE_USE_MOCK !== 'false';
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080';

  return {
    plugins: [react(), useMock && mockApi()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: useMock ? undefined : { '/api': { target: backendUrl, changeOrigin: true } },
    },
  };
});
