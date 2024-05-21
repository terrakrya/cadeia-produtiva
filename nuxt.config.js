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
      offlineStrategy: 'NetworkFirst',
      offlineAnalytics: true,
      config: {
        debug: true,
      },
      clientsClaim: true,
      skipWaiting: true,
      importScripts: ['./scripts/service-worker.js'],
      // runtimeCaching: [
      //   {
      //     urlPattern: '.*/api/.*',
      //     handler: 'NetworkOnly',
      //   },
      // ],
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
