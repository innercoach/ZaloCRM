import { registerSW } from 'virtual:pwa-register';

export const updateServiceWorker = registerSW({
  immediate: true,
  onRegistered(registration) {
    if (!registration) return;
    setInterval(() => {
      void registration.update();
    }, 60 * 60 * 1000);
  },
  onRegisterError(error) {
    console.error('[pwa] service worker registration failed:', error);
  },
});
