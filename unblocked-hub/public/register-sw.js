// public/register-sw.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      await navigator.serviceWorker.ready;
      console.log('✅ SW registered, scope:', reg.scope);
    } catch (err) {
      console.error('❌ SW registration failed:', err);
    }
  });
}
