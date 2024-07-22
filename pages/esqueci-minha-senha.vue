<template>
  <div class="bg-brown-3 text-white text-center">
    <b-container>
      <b-row v-if="show_login" align-v="center" style="padding-top: 5em">
        <b-col md="6" offset-md="3">
          <div class="text-primary">
            <h1>IÊ</h1>
            <p>Inteligência econômica ecológica</p>
          </div>
          <b-card class="bg-brown-1 text-left">
            <b-card-body>
              <p>Recuperar senha</p>
              <form class="form-auth-small" @submit.prevent="send">
                <div class="form-group">
                  <input
                    v-model="form.username"
                    v-mask="['###.###.###-##']"
                    type="text"
                    class="form-control"
                    placeholder="Seu CPF"
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
                <button type="submit" class="btn btn-white btn-lg btn-block">
                  Enviar
                </button>
                <br />
                <div class="text-center">
                  <a href="/login" class="text-white"
                    ><small>Cancelar</small></a
                  >
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

      // deixa somente os dígitos do CPF
      this.form.username = this.form.username.replace(/\D/g, '')

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
