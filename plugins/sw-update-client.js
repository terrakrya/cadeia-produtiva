if ('serviceWorker' in navigator) {
    let refreshing = false;
    
    // Auto-reload when new SW activates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  
    // SW registration (simplified for clarity)
    navigator.serviceWorker.register('/sw.js'); // No need for complex event handling here
  }