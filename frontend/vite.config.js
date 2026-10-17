import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createApiHandler } from './mock-server.mjs';

// The local JSON API shares the Vite server, so npm run dev is sufficient.
function localShopApi() {
  const handler = createApiHandler();
  const install = server => { server.middlewares.use((req, res, next) => {
    if (req.url?.startsWith('/api/')) return handler(req, res);
    next();
  }); };
  return { name: 'local-shop-api', configureServer: install, configurePreviewServer: install };
}
export default defineConfig({ plugins: [react(), localShopApi()] });
