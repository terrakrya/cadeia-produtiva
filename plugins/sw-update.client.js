if ('serviceWorker' in navigator) {
    let refreshing = false;
    
    // Auto-reload when new SW activates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  
    // SW registration
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        
        // Detect when new SW is fully activated
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            // Only notify for non-initial installs
            if (navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent('sw-updated', {
                detail: { registration: reg }
              }));
            }
          }
        });
      });
    });
  
    // Optional: Less intrusive notification
    window.addEventListener('sw-updated', () => {
      if (confirm('New version available! Reload now?')) {
        window.location.reload();
      }
    });
  }