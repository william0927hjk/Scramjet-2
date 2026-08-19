// server.js
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const PUBLIC = path.join(__dirname, 'public');

const app = Fastify({ logger: true });

await app.register(fastifyStatic, {
  root: PUBLIC,
  prefix: '/',
  decorateReply: true,
});

// Scramjet v2's browser assets are copied/served from public/scramjet.
// This avoids depending on the internal node_modules directory layout at runtime.
app.register(async function scramjetAssets(instance) {
  const fs = await import('node:fs');
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);

  let pkgRoot;
  try {
    pkgRoot = path.dirname(require.resolve('@mercuryworkshop/scramjet/package.json'));
  } catch {
    instance.log.error('Scramjet package was not installed');
    return;
  }

  const candidates = [
    path.join(pkgRoot, 'dist'),
    path.join(pkgRoot, 'build'),
    pkgRoot,
  ];

  const root = candidates.find(dir => fs.existsSync(dir));
  if (!root) return;

  instance.register(fastifyStatic, {
    root,
    prefix: '/scramjet/',
    decorateReply: false,
  });
});

// Wisp websocket transport.
app.server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/wisp/')) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.destroy();
  }
});

// Do not turn missing JS/module/worker/WASM files into HTML.
app.setNotFoundHandler((req, reply) => {
  const pathname = req.url.split('?')[0];
  const accept = String(req.headers.accept || '');

  if (
    accept.includes('text/html') &&
    !pathname.startsWith('/src/') &&
    !pathname.startsWith('/scramjet/') &&
    !pathname.endsWith('.js') &&
    !pathname.endsWith('.mjs') &&
    !pathname.endsWith('.wasm')
  ) {
    return reply.type('text/html').sendFile('index.html');
  }

  return reply.code(404).type('text/plain').send('Not found');
});

await app.listen({ port: PORT, host: '0.0.0.0' });

console.log(`🚀 http://localhost:${PORT}`);
console.log(`🔌 ws${PORT === 443 ? 's' : ''}://localhost:${PORT}/wisp/`);
