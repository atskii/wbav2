import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serveUsersHtml = () => {
  return {
    name: 'serve-users-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/') {
          req.url = '/users.html';
        }
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), serveUsersHtml()],
  server: {
    port: 5176,
    strictPort: true,
    open: true
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: 'users.html'
    }
  }
});
