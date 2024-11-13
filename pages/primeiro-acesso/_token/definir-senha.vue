<template>
  <div class="bg-brown-3 text-white text-center">
    <b-container>
      <b-row v-if="is_validating" align-v="center" style="padding-top: 5em">
        <h1>Validando...</h1>
      </b-row>
      <b-row v-if="show_form" align-v="center" style="padding-top: 5em">
        <b-col md="6" offset-md="3">
          <div class="text-primary">
            <h1>IÊ</h1>
            <p>Inteligência econômica ecológica</p>
          </div>
          <b-card class="bg-brown-1 text-left">
            <b-card-body>
              <p>Digite uma senha para a sua conta</p>
              <form class="form-auth-small" @submit.prevent="setPassword">
                <div class="form-group">
                  <label for="password">Nova Senha</label>
                  <input
                    v-model="form.password"
                    type="password"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="password_confirmation">Confirme a Senha</label>
                  <input
                    v-model="form.password_confirmation"
                    type="password"
                    class="form-control"
                  />
                </div>
                <div v-if="is_sending" class="alert alert-info">
                  <b-spinner small /> Enviando...
                </div>
                <div v-if="error" class="alert alert-danger">
                  {{ error }}
                </div>
                <button type="submit" class="btn btn-white btn-lg btn-block">
                  Definir Senha
                </button>
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
      is_validating: true,
      show_form: false,
      error: null,
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
      try {
        const resp = await this.$axios.get(`users/first-access/${token}/valid`)
        this.show_form = resp.data
      } catch (err) {
        this.error = 'Token inválido ou expirado'
      }
      this.is_validating = false
    }
  },

  methods: {
    async setPassword() {
      if (this.form.password !== this.form.password_confirmation) {
        this.error = 'As senhas não conferem'
        return
      }

      this.is_sending = true
      this.error = null

      try {
        const token = this.$route.params.token
        const resp = await this.$axios.post(
          `users/first-access/${token}`,
          this.form
        )

        if (resp.data) {
          // Auto login after password set
          const loginData = {
            data: {
              username: resp.data.username,
              password: this.form.password,
            },
          }
          await this.$auth.loginWith('local', loginData)
          this.$router.push('/painel')
        }
      } catch (err) {
        this.error = err.response?.data || 'Erro ao definir senha'
      }

      this.is_sending = false
    },
  },
}
</script>
