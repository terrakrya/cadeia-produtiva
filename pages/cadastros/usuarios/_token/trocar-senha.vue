<template>
  <div class="bg-brown-3 text-white text-center">
    <b-container>
      <b-row v-if="is_validating" align-v="center" style="padding-top: 5em">
        <h1>Validando...</h1>
      </b-row>
      <b-row v-if="show_page" align-v="center" style="padding-top: 5em">
        <b-col md="6" offset-md="3">
          <b-card class="bg-brown-1">
            <b-card-body>
              <img src="~/assets/img/logo.png" />
              <h2 class="mb-4 mt-4">
                <a href="/" class="text-white text-uppercase">
                  Inteligência em economia ecológica
                </a>
              </h2>
              <p>Trocar Senha</p>
              <form class="form-auth-small" @submit.prevent="changePassword">
                <div class="form-group">
                  <label for="password" class="control-label sr-only">
                    Nova senha
                  </label>
                  <input
                    v-model="form.password"
                    type="password"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label
                    for="password_confirmation"
                    class="control-label sr-only"
                  >
                    Confirmação da nova senha
                  </label>
                  <input
                    v-model="form.password_confirmation"
                    type="password"
                    class="form-control"
                  />
                </div>
                <div v-if="is_sending" class="alert alert-info">
                  <b-spinner small /> Alterando a senha...
                </div>
                <div v-if="error" class="alert alert-danger">
                  {{ error }}
                </div>
                <div v-if="info" class="alert alert-info">
                  {{ info }}
                </div>
                <button type="submit" class="btn btn-primary btn-lg btn-block">
                  Alterar a senha
                </button>
                <br />
                <a href="/login" class="text-red">Voltar para o login</a>
              </form>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
      <b-row
        v-if="!is_validating && !show_page"
        align-v="center"
        style="padding-top: 5em"
      >
        <h1>Link de redefinição de senha expirado. Solicite um novo.</h1>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  layout: 'front',

  data() {
    return {
      is_validating: true,
      show_page: false,
      error: null,
      info: null,
      form: {
        password: '',
        password_confirmation: '',
      },
    }
  },

  async created() {
    if (this.$auth.loggedIn) {
      this.$router.push('/painel')
    } else {
      const token = this.$route.params.token
      const resp = await this.$axios.get(`users/password-reset/${token}/valid`)
      this.show_page = resp.data
      this.is_validating = false
    }
  },

  methods: {
    async changePassword() {
      this.error = null
      this.info = null

      if (this.form.password !== this.form.password_confirmation) {
        this.error = 'A confirmação da senha deve ser igual à senha'
        return
      }

      this.is_sending = true

      try {
        const token = this.$route.params.token
        const resp = await this.$axios({
          method: 'POST',
          url: 'users/password-reset/' + token,
          data: this.form,
        })

        const messageSent = resp.data

        if (messageSent) {
          this.info = 'Senha alterada com sucesso'
        } else {
          this.error = 'Não foi possível alterar a senha'
        }
      } catch (err) {
        this.error = err.response.data
      }

      this.is_sending = false
    },
  },
}
</script>
