import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { scramjetPath } from '@mercuryworkshop/scramjet/path';
import { wispServerFactory } from '@mercuryworkshop/wisp-js/server';
import { WebSocketServer } from 'ws';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });
const port = process.env.PORT || 10000;

// 1. Serve static user-interface files (frontend assets)
fastify.register(fastifyStatic, {
    root: join(__dirname, '../public'),
    prefix: '/',
});

// 2. Serve the Scramjet service-worker scripts
fastify.register(fastifyStatic, {
    root: scramjetPath,
    prefix: '/scramjet/',
    decorateReply: false, 
});

// 3. Set up the WebSocket Server for Wisp/Proxy traffic
fastify.ready((err) => {
    if (err) throw err;

    const wss = new WebSocketServer({ server: fastify.server });

    wss.on('connection', (ws, req) => {
        // Factory handles connection routing for web proxy bypass
        const wispServer = wispServerFactory(ws, req);
        
        ws.on('error', (error) => console.error('WebSocket Error:', error));
    });
});

// 4. Run the server on Render's specified port
const start = async () => {
    try {
        await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
        console.log(`Scramjet demo running at http://0.0.0:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
