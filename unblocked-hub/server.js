// server.js – ESM, Node 24+
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const PUBLIC = path.join(__dirname, 'public');

function pkgDir(pkg, ...candidates) {
  const base = path.join(__dirname, 'node_modules', pkg);
  for (const c of candidates) {
    const p = c ? path.join(base, c) : base;
    if (fs.existsSync(p)) return p;
  }
  return base;
}

const scramjetDist = pkgDir('@mercuryworkshop/scramjet', 'dist', 'build', '');
const baremuxDist = pkgDir('@mercuryworkshop/bare-mux', 'dist', '');
const libcurlDist = pkgDir('@mercuryworkshop/libcurl-transport', 'dist', '');

console.log('scramjet →', scramjetDist, '\n  ', fs.readdirSync(scramjetDist).join(', '));
console.log('bare-mux →', baremuxDist, '\n  ', fs.readdirSync(baremuxDist).join(', '));
console.log('libcurl  →', libcurlDist, '\n  ', fs.readdirSync(libcurlDist).join(', '));

const app = Fastify({ logger: true });

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

// SPA fallback only for document navigation, never for missing JS/WASM/assets.
app.setNotFoundHandler((req, reply) => {
  const accept = req.headers.accept || '';
  if (accept.includes('text/html')) {
    return reply.type('text/html').sendFile('index.html');
  }
  return reply.code(404).type('text/plain').send('Not found');
});

await app.listen({ port: PORT, host: '0.0.0.0' });

app.server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/wisp/')) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.destroy();
  }
});

console.log(`🚀 http://localhost:${PORT}`);
console.log(`🔌 ws://localhost:${PORT}/wisp/`);
