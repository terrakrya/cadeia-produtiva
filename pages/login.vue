<template>
  <div class="login bg-brown-3 text-white text-center">
    <b-container>
      <b-row v-if="show_login" align-v="center" style="padding-top: 5em">
        <b-col md="6" offset-md="3">
          <div class="text-primary">
            <h1>IÊ</h1>
            <p>Inteligência econômica ecológica</p>
          </div>
          <b-card class="bg-brown-1">
            <b-card-body>
              <form class="form-auth-small" @submit.prevent="login">
                <p class="text-center">Acessar</p>
                <div class="form-group">
                  <input
                    v-model="form.username"
                    v-mask="['###.###.###-##']"
                    type="text"
                    class="form-control"
                    placeholder="Seu CPF"
                  />
                </div>
                <div class="form-group">
                  <input
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    placeholder="Sua senha"
                  />
                  <div class="text-right">
                    <a href="/esqueci-minha-senha" class="text-white">
                      <small>Esqueci minha senha</small>
                    </a>
                  </div>
                </div>
                <div v-if="is_loading" class="alert alert-info">
                  <b-spinner small /> Fazendo login...
                </div>
                <div v-if="error" class="alert alert-danger">
                  {{ error }}
                </div>
                <button
                  type="submit"
                  class="btn btn-white btn-lg btn-block"
                  :disabled="is_loading"
                >
                  <span v-if="is_loading"><b-spinner small /> Entrando...</span>
                  <span v-else>Entrar</span>
                </button>
                <br />
                <div class="text-center">
                  <NuxtLink
                    to="/primeiro-acesso"
                    class="btn btn-white btn-lg btn-block"
                  >
                    Primeiro Acesso
                  </NuxtLink>
                </div>
              </form>
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
      show_login: false,
      error: null,
      is_loading: false,
      form: {
        username: '',
        password: '',
      },
    }
  },

  created() {
    if (this.$auth.loggedIn) {
      this.$router.push('/painel')
    } else {
      this.show_login = true
    }
  },

  methods: {
    async login() {
      // Prevent multiple submissions
      if (this.is_loading) {
        return
      }

      this.error = null
      this.is_loading = true

      try {
        const dados = {
          data: {
            username: this.form.username.replace(/\D/g, ''),
            password: this.form.password,
          },
        }

        const resp = await this.$auth.loginWith('local', dados)

        if (resp) {
          this.$router.push(this.$route.query.redirect || '/painel')
        }
      } catch (error) {
        if (error.response && error.response.data) {
          this.error = error.response.data
        } else {
          this.showError(error)
        }
      } finally {
        // Always make sure to reset loading state
        this.is_loading = false
      }
    },
  },
}
</script>
