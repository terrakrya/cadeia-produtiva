import localforage from 'localforage'

export default ({ app, $axios }, inject) => {
  // Cria storages separados para diferentes tipos de dados
  const cacheStores = {
    user: localforage.createInstance({ name: 'userCache' }),
    reference: localforage.createInstance({ name: 'referenceData' }),
    forms: localforage.createInstance({ name: 'formData' }),
    view: localforage.createInstance({ name: 'viewData' })
  }

  // Função para armazenar dados de usuário
  const cacheUserData = async (userData) => {
    if (!userData) return
    await cacheStores.user.setItem('currentUser', userData)
  }

  // Função para carregar dados de referência essenciais
  const cacheReferenceData = async () => {
    if (!navigator.onLine) return

    try {
      // Cache de organizações
      const organizations = await $axios.$get('organizations')
      await cacheStores.reference.setItem('organizations', organizations)

      // Cache de produtos
      const products = await $axios.$get('products')
      await cacheStores.reference.setItem('products', products)

      // Cache de estados e cidades (ajustar conforme sua API)
      const estados = await $axios.$get('locations/estados')
      await cacheStores.reference.setItem('estados', estados)

      // Outros dados de referência necessários para os formulários
      const buyerPositions = await $axios.$get('buyer-positions')
      await cacheStores.reference.setItem('buyerPositions', buyerPositions)
    } catch (error) {
      console.error('Erro ao armazenar dados de referência:', error)
    }
  }

  // Função para obter dados em cache
  const getCachedData = async (store, key) => {
    try {
      return await cacheStores[store].getItem(key)
    } catch (error) {
      console.error(`Erro ao recuperar ${key} do cache:`, error)
      return null
    }
  }

  // Expor funções para uso nos componentes
  inject('cacheUserData', cacheUserData)
  inject('cacheReferenceData', cacheReferenceData)
  inject('getCachedData', getCachedData)
  
  // Atualizar o cache sempre que o Auth muda
  if (process.client && app.$auth) {
    // Observar mudanças no estado de autenticação
    const unwatch = app.$auth.$storage.watchState('user', (newUser) => {
      if (newUser) {
        cacheUserData(newUser)
      }
    })
    
    // Se já estiver logado, armazenar dados do usuário imediatamente
    if (app.$auth.user) {
      cacheUserData(app.$auth.user)
    }
    
    // Carregar dados de referência ao iniciar se estiver online
    if (navigator.onLine) {
      // Pequeno atraso para garantir que a autenticação esteja completa
      setTimeout(cacheReferenceData, 2000)
    }
  }
} 