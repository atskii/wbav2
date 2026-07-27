import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serveAnalyticsHtml = () => {
  return {
    name: 'serve-analytics-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/') {
          req.url = '/analytics.html';
        }
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), serveAnalyticsHtml()],
  server: {
    port: 5175,
    strictPort: true,
    open: false
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: 'analytics.html'
    }
  }
});
