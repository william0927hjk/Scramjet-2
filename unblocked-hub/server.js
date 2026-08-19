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

// Helper: find the right subfolder inside a package
function pkgDir(pkg, ...candidates) {
  const base = path.join(__dirname, 'node_modules', pkg);
  for (const c of candidates) {
    const p = c ? path.join(base, c) : base;
    if (fs.existsSync(p)) return p;
  }
  // fallback: package root
  return base;
}

const scramjetDist  = pkgDir('@mercuryworkshop/scramjet',          'dist', 'build', '');
const baremuxDist   = pkgDir('@mercuryworkshop/bare-mux',          'dist', '');
const libcurlDist   = pkgDir('@mercuryworkshop/libcurl-transport', 'dist', '');

console.log('scramjet →', scramjetDist,  '|', fs.readdirSync(scramjetDist).join(', '));
console.log('bare-mux →', baremuxDist,   '|', fs.readdirSync(baremuxDist).join(', '));
console.log('libcurl  →', libcurlDist,   '|', fs.readdirSync(libcurlDist).join(', '));

// ─── Fastify ──────────────────────────────────────────────────────────────────
const app = Fastify({ logger: false });

// Asset routes – registered BEFORE the public catch-all
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

// public/ – last, acts as catch-all for /, /sw.js, /manifest.json etc.
await app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
  decorateReply: false,
});

// ─── Catch-all SPA fallback ───────────────────────────────────────────────────
// Any URL the SW hasn't intercepted yet (first load / hard refresh) gets
// index.html so the page loads, the SW activates, then handles it itself.
app.setNotFoundHandler((_req, reply) => {
  reply.sendFile('index.html', path.join(__dirname, 'public'));
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
await app.listen({ port: PORT, host: '0.0.0.0' });

// Wisp WS upgrade – attach AFTER listen so app.server exists
app.server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/wisp/')) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.destroy();
  }
});

console.log(`🚀 http://localhost:${PORT}`);
console.log(`🔌 ws://localhost:${PORT}/wisp/`);
