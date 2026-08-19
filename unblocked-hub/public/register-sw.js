// public/register-sw.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('✅ ServiceWorker registered (scope: %s)', reg.scope);
      })
      .catch(err => {
        console.error('❌ ServiceWorker registration failed:', err);
      });
  });
}