<template>
  <div class="bg-brown-3 text-white text-center">
    <b-container>
      <b-row v-if="show_login" align-v="center" style="padding-top: 5em">
        <b-col md="6" offset-md="3">
          <b-card class="bg-brown-1">
            <b-card-body>
              <img src="~/assets/img/logo.png" />
              <h2 class="mb-4 mt-4">
                <a href="/" class="text-white text-uppercase">
                  Cadeia Produtiva
                </a>
              </h2>
              <p>Esqueci minha senha</p>
              <form class="form-auth-small" @submit.prevent="send">
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
                <div v-if="is_sending" class="alert alert-info">
                  <b-spinner small /> Enviando...
                </div>
                <div v-if="error" class="alert alert-danger">
                  {{ error }}
                </div>
                <div v-if="info" class="alert alert-info">
                  {{ info }}
                </div>
                <button type="submit" class="btn btn-primary btn-lg btn-block">
                  Enviar
                </button>
                <br />
                <a href="/login" class="text-red">Voltar para o login</a>
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
      info: null,
      form: {
        username: '',
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
    async send() {
      this.is_sending = true
      this.error = null
      this.info = null

      try {
        const resp = await this.$axios({
          method: 'POST',
          url: 'users/forgot-password',
          data: this.form,
        })

        const messageSent = resp.data

        if (messageSent) {
          this.info = 'Foi enviada a redefinição de senha para seu e-mail'
        } else {
          this.error = 'Não foi possível enviar a redefinição de senha'
        }
      } catch (err) {
        this.error = err.response.data
      }

      this.is_sending = false
    },
  },
}
</script>
