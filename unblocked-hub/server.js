import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import { createServer } from 'http';
import { createBareServer } from '@mercuryworkshop/bare-server-node'; // or wisp
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = Fastify();
const PORT = process.env.PORT || 8080;

await app.register(staticPlugin, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

const server = createServer(app.server ? undefined : app.callback?.());

// Wisp WebSocket handling (Scramjet's transport)
import { WispServer } from '@mercuryworkshop/wisp-js/server';
const wisp = new WispServer();

app.server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/wisp/')) {
    wisp.handleUpgrade(req, socket, head);
  }
});

await app.listen({ port: PORT });
console.log(`Listening on http://localhost:${PORT}`);
