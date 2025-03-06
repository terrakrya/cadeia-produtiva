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
  }
} 