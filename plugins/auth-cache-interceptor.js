export default function ({ $auth, $cacheUserData }) {
  // Intercepta quando o usuário é carregado
  if (process.client && $auth) {
    const originalSetUser = $auth.setUser
    $auth.setUser = function (user) {
      // Chamar a implementação original
      const result = originalSetUser.call(this, user)

      // Cache o usuário para uso offline
      if (user) {
        $cacheUserData(user)
      }

      return result
    }

    // Intercepta o logout para limpar o cache
    const originalLogout = $auth.logout
    $auth.logout = async function () {
      try {
        // 1. Limpa Service Worker cache da rota /api/profile
        if ('caches' in window) {
          const cache = await caches.open('user-cache')
          await cache.keys().then(requests => 
            Promise.all(requests.map(request => cache.delete(request)))
          )
        }

        // 2. Limpa LocalForage com dados do usuário
        const localforage = await import('localforage')
        const userCache = localforage.default.createInstance({ name: 'userCache' })
        await userCache.clear()

      } catch (error) {
        console.error('Erro ao limpar cache do usuário:', error)
      }
      
      // Chama o logout original
      return originalLogout.call(this)
    }
  }
}
