export default function ({ $auth, $cacheUserData }) {
  // Intercepta quando o usuário é carregado
  if (process.client && $auth) {
    const originalSetUser = $auth.setUser
    $auth.setUser = function(user) {
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
    $auth.logout = async function() {
      // Limpa o cache do usuário antes do logout
      try {
        const localforage = await import('localforage')
        const userCache = localforage.default.createInstance({ name: 'userCache' })
        await userCache.clear()
      } catch (error) {
        console.error('Erro ao limpar cache no logout:', error)
      }
      
      // Chama o logout original
      return originalLogout.call(this)
    }
  }
} 