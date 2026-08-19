// server.js – ESM, Node 24+
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 8080;
const PUBLIC    = path.join(__dirname, 'public');
const INDEX     = path.join(PUBLIC, 'index.html');

// Helper: find the right subfolder inside a package
function pkgDir(pkg, ...candidates) {
  const base = path.join(__dirname, 'node_modules', pkg);
  for (const c of candidates) {
    const p = c ? path.join(base, c) : base;
    if (fs.existsSync(p)) return p;
  }
  return base;
}

const scramjetDist = pkgDir('@mercuryworkshop/scramjet',          'dist', 'build', '');
const baremuxDist  = pkgDir('@mercuryworkshop/bare-mux',          'dist', '');
const libcurlDist  = pkgDir('@mercuryworkshop/libcurl-transport', 'dist', '');

console.log('scramjet →', scramjetDist, '\n  ', fs.readdirSync(scramjetDist).join(', '));
console.log('bare-mux →', baremuxDist,  '\n  ', fs.readdirSync(baremuxDist).join(', '));
console.log('libcurl  →', libcurlDist,  '\n  ', fs.readdirSync(libcurlDist).join(', '));

// ─── Fastify ──────────────────────────────────────────────────────────────────
const app = Fastify({ logger: false });

// First registration decorates reply (sendFile becomes available)
await app.register(fastifyStatic, {
  root:   PUBLIC,
  prefix: '/',
});

// Subsequent registrations must set decorateReply: false
await app.register(fastifyStatic, {
  root:          scramjetDist,
  prefix:        '/scramjet/',
  decorateReply: false,
});

await app.register(fastifyStatic, {
  root:          baremuxDist,
  prefix:        '/baremux/',
  decorateReply: false,
});

await app.register(fastifyStatic, {
  root:          libcurlDist,
  prefix:        '/libcurl/',
  decorateReply: false,
});

// ─── Catch-all: return index.html for any unmatched route ────────────────────
// Covers the case where the SW hasn't activated yet and the browser sends
// a real GET for /scramjet/<encoded-url> or any other client-side route.
app.setNotFoundHandler((_req, reply) => {
  reply.sendFile('index.html');
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
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
