// src/index.js
// -------------------------------------------------
// UI helper functions – identical to the previous inline script
// -------------------------------------------------

/* ---------- Tab navigation ---------- */
export function showTab(id) {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ---------- Games ---------- */
export function loadGame(url) {
  const frame = document.getElementById('gameFrame');
  frame.src = url;
  frame.style.display = 'block';
}

/* ---------- AI ---------- */
export async function sendAI() {
  const inputEl = document.getElementById('ai-input');
  const prompt = inputEl.value.trim();
  if (!prompt) return;
  const output = document.getElementById('ai-output');
  output.innerHTML += `<p><em>You:</em> ${escapeHTML(prompt)}</p>`;
  inputEl.value = '';
  output.scrollTop = output.scrollHeight;
  try {
    const resp = await fetch('/api/ai-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await resp.json();
    output.innerHTML += `<p>${data.reply}</p>`;
  } catch (e) {
    output.innerHTML += `<p style="color:#f88;">❌ Failed to reach AI service.</p>`;
  }
  output.scrollTop = output.scrollHeight;
}

/* ---------- Proxy ---------- */
export function openProxy() {
  let url = document.getElementById('proxy-url').value.trim();
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const encoded = encodeURIComponent(url);
  const proxySrc = `/proxy/${encoded}`;
  const frame = document.getElementById('proxyFrame');
  frame.src = proxySrc;
  frame.style.display = 'block';
}

/* ---------- Settings – theme toggle ---------- */
export function changeTheme() {
  const theme = document.getElementById('theme-select').value;
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
}

/* ---------- Helper – HTML escaping ---------- */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

/* ---------- Persist theme between sessions ---------- */
import { sessionStorage } from 'node-sessionstorage';
(function restoreTheme() {
  const saved = sessionStorage.getItem('unblockedHubTheme');
  if (saved) {
    document.getElementById('theme-select').value = saved;
    changeTheme();
  }
})();

document.getElementById('theme-select')
  .addEventListener('change', function () {
    sessionStorage.setItem('unblockedHubTheme', this.value);
  });

/* ---------- Expose functions to the global scope ---------- (so the inline onclick attributes in index.html can call them) */
window.showTab = showTab;
window.loadGame = loadGame;
window.sendAI = sendAI;
window.openProxy = openProxy;
window.changeTheme = changeTheme;