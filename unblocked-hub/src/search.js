// src/search.js
export function initGameSearch() {
  const input = document.getElementById('game-search');
  const items = document.querySelectorAll('.game-item');

  input.addEventListener('input', () => {
    const term = input.value.toLowerCase();
    items.forEach(item => {
      const txt = item.textContent.toLowerCase();
      item.style.display = txt.includes(term) ? '' : 'none';
    });
  });
}