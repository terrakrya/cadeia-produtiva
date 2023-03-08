<template>
  <div class="login bg-brown-3 text-white text-center">
    <b-container>
      <b-row v-if="show_login" align-v="center" style="padding-top: 5em">
        <b-col md="6" offset-md="3">
          <b-card class="bg-brown-1">
            <b-card-body>
              <p>Seja bem vindo</p>
              <form class="form-auth-small" @submit.prevent="login">
                <div class="form-group">
                  <label for="signin-email" class="control-label sr-only">
                    Login ou celular
                  </label>
                  <input
                    v-model="form.username"
                    type="text"
                    class="form-control"
                    placeholder="Login ou celular"
                  />
                </div>
                <div class="form-group">
                  <label for="signin-password" class="control-label sr-only">
                    Senha
                  </label>
                  <input
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    placeholder="Senha"
                  />
                </div>
                <div v-if="is_loading" class="alert alert-info">
                  <b-spinner small /> Fazendo login...
                </div>
                <div v-if="error" class="alert alert-danger">
                  {{ error }}
                </div>
                <button type="submit" class="btn btn-primary btn-lg btn-block">
                  Entrar
                </button>
                <br />
                <a href="/esqueci-minha-senha" class="text-red">
                  Esqueci minha senha
                </a>
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
      this.error = null
      this.is_loading = true

      const resp = await this.$auth
        .loginWith('local', { data: this.form })
        .catch((error) => {
          if (error.response && error.response.data) {
            this.error = error.response.data
          } else {
            this.showError(error)
          }
        })

      if (resp) {
        this.$router.push(this.$route.query.redirect || '/painel')
      }
      this.is_loading = false
    },
  },
}
</script>
