// public/src/index.js – Scramjet client bootstrap (type="module")
// Initialises bare-mux with the libcurl.js WASM transport.
// This runs once per page load; the SW handles all subsequent fetches.

import { BareMuxConnection } from '/baremux/index.js';

const wispUrl =
  (location.protocol === 'https:' ? 'wss://' : 'ws://') +
  location.host + '/wisp/';

const conn = new BareMuxConnection('/baremux/worker.js');

// Only set transport if not already configured (avoids redundant WASM loads)
const current = await conn.getTransport();
if (!current || current === '') {
  await conn.setTransport('/libcurl/index.mjs', [{ wisp: wispUrl }]);
  console.log('✅ bare-mux → libcurl via', wispUrl);
}
