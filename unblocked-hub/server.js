// server.js
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const PUBLIC = path.join(__dirname, 'public');

function pkgDir(pkg, ...candidates) {
  const base = path.join(__dirname, 'node_modules', pkg);
  for (const candidate of candidates) {
    const dir = candidate ? path.join(base, candidate) : base;
    if (fs.existsSync(dir)) return dir;
  }
  throw new Error(`Could not find package directory for ${pkg}`);
}

const scramjetDist = pkgDir('@mercuryworkshop/scramjet', 'dist', 'build', '');
const baremuxDist = pkgDir('@mercuryworkshop/bare-mux', 'dist', '');
const libcurlDist = pkgDir('@mercuryworkshop/libcurl-transport', 'dist', '');

const app = Fastify({ logger: true });

console.log('Scramjet:', scramjetDist);
console.log('BareMux:', baremuxDist);
console.log('libcurl:', libcurlDist);

await app.register(fastifyStatic, {
  root: PUBLIC,
  prefix: '/',
});

await app.register(fastifyStatic, {
  root: scramjetDist,
  prefix: '/scramjet/',
  decorateReply: false,
});

await app.register(fastifyStatic, {
  root: baremuxDist,
  prefix: '/baremux/',
  decorateReply: false,
});

await app.register(fastifyStatic, {
  root: libcurlDist,
  prefix: '/libcurl/',
  decorateReply: false,
});

// Only return index.html for browser document navigations.
// Never turn a missing JS/WASM/worker file into HTML.
app.setNotFoundHandler((req, reply) => {
  const accept = String(req.headers.accept || '');
  const pathname = req.url.split('?')[0];

  if (
    accept.includes('text/html') &&
    !pathname.startsWith('/src/') &&
    !pathname.startsWith('/scramjet/') &&
    !pathname.startsWith('/baremux/') &&
    !pathname.startsWith('/libcurl/') &&
    !pathname.endsWith('.js') &&
    !pathname.endsWith('.mjs') &&
    !pathname.endsWith('.wasm')
  ) {
    return reply.type('text/html').sendFile('index.html');
  }

  return reply.code(404).type('text/plain').send('Not found');
});

await app.listen({ port: PORT, host: '0.0.0.0' });

app.server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/wisp/')) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.destroy();
  }
});

console.log(`🚀 http://localhost:${PORT}`);
console.log(`🔌 ws://localhost:${PORT}/wisp/`);
