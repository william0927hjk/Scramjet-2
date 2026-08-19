// public/src/index.js – Scramjet client bootstrap

import { BareMuxConnection } from '/baremux/index.js';

const wispUrl =
  (location.protocol === 'https:' ? 'wss://' : 'ws://') +
  location.host + '/wisp/';

const conn = new BareMuxConnection('/baremux/worker.js');

const current = await conn.getTransport();

if (!current || current === '') {
  await conn.setTransport('/libcurl/index.mjs', [{ wisp: wispUrl }]);
  console.log('✅ bare-mux → libcurl via', wispUrl);
}
