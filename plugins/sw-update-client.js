if ('serviceWorker' in navigator) {
  let refreshing = false
  let newWorker

  function showUpdateNotification() {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Atualização Disponível', {
        body: 'Uma nova versão do aplicativo está pronta. Clique para atualizar.',
        icon: '/icon.png'
      })
      notification.onclick = () => {
        if (newWorker) {
          newWorker.postMessage({ action: 'skipWaiting' })
        }
        notification.close()
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          showUpdateNotification()
        }
      })
    }
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  navigator.serviceWorker.register('/sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      newWorker = reg.installing
      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          showUpdateNotification()
        }
      })
    })
  })
}
