import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { ServerResponse } from 'http';

function localRealtimePlugin(): Plugin {
  const clients = new Set<ServerResponse>();

  return {
    name: 'local-realtime-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/realtime-stream')) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });
          res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);
          clients.add(res);
          req.on('close', () => clients.delete(res));
          return;
        }

        if (req.url?.startsWith('/api/realtime-broadcast') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const eventMsg = `data: ${JSON.stringify(data)}\n\n`;
              for (const client of clients) {
                try {
                  client.write(eventMsg);
                } catch {
                  clients.delete(client);
                }
              }
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ ok: true }));
            } catch {
              res.writeHead(400);
              res.end();
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localRealtimePlugin()],
  server: {
    port: 3000,
    host: true
  }
});
