// src/index.js  –  Scramjet client bootstrap (loaded as type="module")
// Initialises bare-mux with the libcurl transport pointing at our Wisp server.

import { BareMux } from '/baremux/index.js';
import { LibcurlConnection } from '/libcurl/index.js';

// Wisp endpoint – same origin, so derive it from the current location
const wispUrl =
  (location.protocol === 'https:' ? 'wss://' : 'ws://') +
  location.host +
  '/wisp/';

const mux = new BareMux('/baremux/worker.js');

// Only set the transport once; skip if a SW from a previous page load
// already set it.
const existing = await mux.getTransport();
if (!existing) {
  await mux.setTransport('/libcurl/index.mjs', [{ wisp: wispUrl }]);
  console.log('✅ bare-mux transport set → libcurl via', wispUrl);
}
