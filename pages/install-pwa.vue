<template>
  <div class="install-pwa bg-brown-3 text-white text-center">
    <b-container>
      <b-row align-v="center" style="padding-top: 5em">
        <b-col md="6" offset-md="3">
          <div class="text-primary">
            <h1>IÊ</h1>
            <p>Inteligência econômica ecológica</p>
          </div>
          <b-card class="bg-brown-1">
            <b-card-body>
              <h2>Instale nosso aplicativo</h2>
              <p>Para uma melhor experiência, instale o aplicativo em seu dispositivo:</p>
              
              <!-- Install button - only shows when prompt is available -->
              <div v-if="deferredPrompt" class="mt-4">
                <b-button class="btn btn-white btn-lg btn-block" @click="installPWA">
                  Instalar Aplicativo
                </b-button>
              </div>

              <!-- Manual installation instructions - shows when prompt isn't available -->
              <div v-else class="mt-4">
                <h4>Como instalar:</h4>
                <ul class="text-left">
                  <li v-if="isIOS" class="mb-2">
                    Abra o menu do navegador 
                    <span class="text-primary">
                      <font-awesome-icon icon="fa-solid fa-share-from-square" />
                    </span> 
                    e selecione "Adicionar à Tela de Início"
                  </li>
                  <li v-if="isAndroid" class="mb-2">
                    No navegador, abra o menu (⋮ ou ≡) no canto da tela
                    <span class="text-primary">
                      <font-awesome-icon icon="fa-solid fa-ellipsis-vertical" />
                    </span> 
                    e selecione "Adicionar à tela inicial" ou "Instalar aplicativo"
                  </li>
                  <li v-if="!isIOS && !isAndroid" class="mb-2">
                    No seu navegador, procure pelo ícone de instalação 
                    <span class="text-primary">
                      <font-awesome-icon icon="fa-solid fa-download" />
                    </span> 
                    na barra de endereço ou no menu do navegador e selecione "Instalar" ou "Adicionar à tela inicial"
                  </li>
                </ul>
              </div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  layout: 'front',
  
  data() {
    return {
      isIOS: process.client && /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: process.client && /Android/.test(navigator.userAgent),
      deferredPrompt: null
    }
  },

  mounted() {
    if (process.client) {
      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault()
        // Stash the event so it can be triggered later
        this.deferredPrompt = e
      })

      // Listen for successful installation
      window.addEventListener('appinstalled', () => {
        // Clear the deferredPrompt so the button won't show anymore
        this.deferredPrompt = null
        // Optionally redirect to login after successful installation
        this.$router.push('/login')
      })
    }
  },

  methods: {
    async installPWA() {
      if (!this.deferredPrompt) return

      // Show the install prompt
      this.deferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice
      
      // Optionally log the outcome
      console.log(`User response to the install prompt: ${outcome}`)

      // Clear the deferredPrompt - it can't be used again
      this.deferredPrompt = null
    },
  }
}
</script>
  