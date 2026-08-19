// public/register-sw.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('✅ Scramjet SW registered (scope: %s)', reg.scope);
    } catch (err) {
      console.error('❌ SW registration failed:', err);
    }
  });
}
