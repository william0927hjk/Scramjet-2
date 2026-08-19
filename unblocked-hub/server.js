// server.js  –  ESM (matches "type":"module" in package.json)
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 8080;

// ─── Fastify ──────────────────────────────────────────────────────────────────
const app = Fastify({ logger: false });

// public/ → index.html, sw.js, register-sw.js, manifest.json …
await app.register(fastifyStatic, {
  root:   path.join(__dirname, 'public'),
  prefix: '/',
});

// Scramjet SW bundle → /scramjet/scramjet.sw.js etc.
await app.register(fastifyStatic, {
  root:          path.join(__dirname, 'node_modules/@mercuryworkshop/scramjet/dist'),
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

// ─── Start ────────────────────────────────────────────────────────────────────
await app.listen({ port: PORT, host: '0.0.0.0' });

// ─── Wisp WebSocket server ────────────────────────────────────────────────────
// wisp.routeRequest is a drop-in upgrade handler from @mercuryworkshop/wisp-js
app.server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/wisp/')) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.destroy();
  }
});

console.log(`🚀  Server running  →  http://localhost:${PORT}`);
console.log(`🔌  Wisp endpoint   →  ws://localhost:${PORT}/wisp/`);
