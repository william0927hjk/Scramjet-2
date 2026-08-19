// public/src/index.js
// BareMux/libcurl bootstrap for the Scramjet application.

import { BareMuxConnection } from '/baremux/index.js';

const wispUrl =
  `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/wisp/`;

const connection = new BareMuxConnection('/baremux/worker.js');

const current = await connection.getTransport();

if (!current || current === '') {
  await connection.setTransport('/libcurl/index.mjs', [{ wisp: wispUrl }]);
  console.log('✅ bare-mux → libcurl via', wispUrl);
}

window.dispatchEvent(new Event('baremux-ready'));
