import localforage from 'localforage'

export default ({ app, $axios }, inject) => {
  const syncOfflineData = async () => {
    if (!navigator.onLine) return
    
    try {
      // Sync pending price information
      const pendingPrices = (await localforage.getItem('pendingPrices')) || []
      if (pendingPrices.length > 0) {
        let hasErrors = false
        for (const price of pendingPrices) {
          try {
            await $axios.post('price-informations', price)
          } catch (error) {
            console.error('Erro ao sincronizar o preço:', error)
            hasErrors = true
          }
        }
        
        if (!hasErrors) {
          await localforage.removeItem('pendingPrices')
          app.$notify && app.$notify({
            title: 'Sincronização',
            text: 'Preços pendentes sincronizados com sucesso!'
          })
        }
      }
      
      // Sync pending ecological data
      const pendingEcologicalData = (await localforage.getItem('pendingEcologicalData')) || []
      if (pendingEcologicalData.length > 0) {
        let hasErrors = false
        for (const item of pendingEcologicalData) {
          try {
            await $axios({
              method: item.method,
              url: item.url,
              data: item.data
            })
          } catch (error) {
            console.error('Erro ao sincronizar dados ecológicos:', error)
            hasErrors = true
          }
        }
        
        if (!hasErrors) {
          await localforage.removeItem('pendingEcologicalData')
          app.$notify && app.$notify({
            title: 'Sincronização',
            text: 'Dados ecológicos pendentes sincronizados com sucesso!'
          })
        }
      }
    } catch (error) {
      console.error('Erro durante a sincronização:', error)
    }
  }

  // Expose the sync function
  inject('syncOfflineData', syncOfflineData)
  
  // Set up automatic sync when online
  if (process.client) {
    window.addEventListener('online', syncOfflineData)
    
    // Also sync when the app starts if online
    if (navigator.onLine) {
      // Small delay to make sure everything is loaded
      setTimeout(syncOfflineData, 2000)
    }
  }
} 