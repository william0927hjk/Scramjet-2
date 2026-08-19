// server.js  –  ESM (matches "type":"module" in package.json)
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 8080;

// ─── Resolve scramjet dist path (handles different package layouts) ───────────
const scramjetBase = path.join(__dirname, 'node_modules/@mercuryworkshop/scramjet');
let scramjetDist = path.join(scramjetBase, 'dist');
if (!fs.existsSync(scramjetDist)) {
  // Some releases use /build instead of /dist
  scramjetDist = path.join(scramjetBase, 'build');
}
if (!fs.existsSync(scramjetDist)) {
  // Flat layout — assets directly in package root
  scramjetDist = scramjetBase;
}
console.log('📦 Scramjet assets →', scramjetDist);
console.log('   Contents:', fs.readdirSync(scramjetDist).join(', '));

// ─── Fastify ──────────────────────────────────────────────────────────────────
const app = Fastify({ logger: false });

// Scramjet SW bundle → /scramjet/scramjet.sw.js etc.
// Must be registered BEFORE the public catch-all so /scramjet/* hits this first.
await app.register(fastifyStatic, {
  root:          scramjetDist,
  prefix:        '/scramjet/',
  decorateReply: false,
});

// bare-mux worker → /baremux/worker.js
await app.register(fastifyStatic, {
  root:          path.join(__dirname, 'node_modules/@mercuryworkshop/bare-mux/dist'),
  prefix:        '/baremux/',
  decorateReply: false,
});

// libcurl transport → /libcurl/index.mjs
await app.register(fastifyStatic, {
  root:          path.join(__dirname, 'node_modules/@mercuryworkshop/libcurl-transport/dist'),
  prefix:        '/libcurl/',
  decorateReply: false,
});

// public/ → index.html, sw.js, register-sw.js, manifest.json …
// Registered LAST so it acts as the catch-all.
await app.register(fastifyStatic, {
  root:          path.join(__dirname, 'public'),
  prefix:        '/',
  decorateReply: false,
});

// ─── Catch-all: any unmatched route serves index.html ─────────────────────────
// This is critical — when the Scramjet SW intercepts /scramjet/<encoded-url>,
// it never actually hits the server. But if the SW isn't active yet (first load,
// hard refresh), the browser sends a real GET. Return index.html so the page
// loads, the SW registers, and then the SW handles it from there.
app.setNotFoundHandler((req, reply) => {
  reply.sendFile('index.html', path.join(__dirname, 'public'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
await app.listen({ port: PORT, host: '0.0.0.0' });

// ─── Wisp WebSocket server ────────────────────────────────────────────────────
app.server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/wisp/')) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.destroy();
  }
});

console.log(`🚀  Server running  →  http://localhost:${PORT}`);
console.log(`🔌  Wisp endpoint   →  ws://localhost:${PORT}/wisp/`);
