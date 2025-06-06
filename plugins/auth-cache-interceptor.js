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
        // Limpa apenas o cache da rota /api/profile
        if ('caches' in window) {
          const cacheNames = await caches.keys()

          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName)
            const requests = await cache.keys()

            // Remove apenas requests que sejam /api/profile
            await Promise.all(
              requests.map((request) => {
                if (request.url.includes('/api/profile')) {
                  return cache.delete(request)
                }
              })
            )
          }
        }
      } catch (error) {
        console.error('Erro ao limpar cache do profile:', error)
      }
      // Chama o logout original
      return originalLogout.call(this)
    }
  }
}
