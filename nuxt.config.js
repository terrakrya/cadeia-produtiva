export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  serverMiddleware: ['~/api/index.js'],
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Inteligência em economia ecológica',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description,
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/css/custom.sass',
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/global-mixin',
    '~/plugins/axios-api',
    '~/plugins/vue-the-mask',
    '~/plugins/vue-moment',
    '~/plugins/vue-notification',
    '~/plugins/vue2-filters',
    '~/plugins/vee-validate',
    '~/plugins/v-money',
    '~/plugins/fontawesome.js',
    '~/plugins/sw-update-client.js',
    '~/plugins/offline-sync-service.js',
    '~/plugins/offline-cache-service.js',
    '~/plugins/auth-cache-interceptor.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    // '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    // '@nuxtjs/stylelint-module',
    '@nuxtjs/localforage',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
    '@nuxtjs/auth-next',
    'nuxt-leaflet',
  ],

  bootstrapVue: {
    icons: true,
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: (process.env.BASE_URL || '') + '/api/',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'pt-BR',
      name: 'IÊ',
      short_name: 'IÊ',
    },
    meta: {
      ogHost: process.env.BASE_URL,
      ogImage: '/icon.png',
    },
    workbox: {
      offlineStrategy: 'StaleWhileRevalidate',
      offlineAnalytics: false,
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          // Cache para dados do usuário (DEVE VIR PRIMEIRO - mais específico)
          urlPattern: '.*/api/profile',
          handler: 'NetworkFirst',
          method: 'GET',
          strategyOptions: {
            cacheName: 'user-cache',
            cacheExpiration: {
              maxEntries: 1,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
            },
          },
        },
        {
          // Cache de APIs de dados de referência
          urlPattern:
            '.*/api/(products|organizations|locations|buyer-positions|species|species-products).*',
          handler: 'NetworkFirst',
          method: 'GET',
          strategyOptions: {
            cacheName: 'reference-data-cache',
            cacheExpiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
            },
          },
        },
        {
          // Cache de APIs de dados dinâmicos (excluindo profile, price-informations e ecological-data)
          urlPattern:
            '.*/api/(?!profile$|price-informations$|ecological-data$).*',
          handler: 'StaleWhileRevalidate',
          method: 'GET',
          strategyOptions: {
            cacheName: 'api-cache',
            cacheExpiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 1 dia
            },
          },
        },
        {
          // Não cachear requisições POST/PUT
          urlPattern: '.*/api/.*',
          handler: 'NetworkOnly',
          method: 'POST|PUT',
        },
      ],
    },
  },

  localforage: {
    name: process.env.npm_package_name || 'NuxtJS',
  },

  content: {},

  auth: {
    strategies: {
      local: {
        token: {
          property: 'token',
          type: 'Token',
        },
        user: {
          property: false,
          // autoFetch: true
        },
        endpoints: {
          login: {
            url: '/login',
            method: 'post',
          },
          logout: { url: '/logout', method: 'post' },
          user: { url: '/profile', method: 'get' },
        },
      },
    },
    scope: 'role',
  },
  proxy: {
    pathRewrite: {
      '^/api/': '/',
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  build: {},
}
