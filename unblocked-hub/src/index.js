import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { scramjetPath } from '@mercuryworkshop/scramjet/path';
import { server as wisp } from '@mercuryworkshop/wisp-js/server'; // Correct named import syntax
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

// 3. Set up the server on Render's specified port
const start = async () => {
    try {
        await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
        console.log(`Scramjet demo running at http://0.0.0:${port}`);

        // 4. Attach Wisp route handling to the native HTTP server upgrade hook
        fastify.server.on('upgrade', (req, socket, head) => {
            wisp.routeRequest(req, socket, head);
        });

    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
