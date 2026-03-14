import { useEffect } from 'react';

export const useServiceWorkerUpdate = () => {
  useEffect(() => {
    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker-update.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
          
          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
              console.log('📲 Update available - reloading...');
              // Auto-reload page to get latest version
              window.location.reload();
            }
          });

          // Check for updates on app open
          setInterval(() => {
            if (registration.active) {
              registration.active.postMessage({ type: 'CHECK_FOR_UPDATES' });
            }
          }, 60000); // Check every minute

          // Initial check
          if (registration.active) {
            registration.active.postMessage({ type: 'CHECK_FOR_UPDATES' });
          }
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);
};
