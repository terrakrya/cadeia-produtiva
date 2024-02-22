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
              <form class="form-auth-small" @submit.prevent="send">
                <div>
                  <b-form-group label="Nova Senha" label-class="text-white">
                    <b-form-input
                      v-model="form.password"
                      type="password"
                      name="password"
                    />
                    <field-error :msg="veeErrors" field="password" />
                  </b-form-group>
                </div>
                <div>
                  <b-form-group
                    label="Confirme a nova senha"
                    label-class="text-white"
                  >
                    <b-form-input
                      v-model="form.password_confirmation"
                      type="password"
                      name="password_confirmation"
                    />
                    <field-error
                      :msg="veeErrors"
                      field="password_confirmation"
                    />
                  </b-form-group>
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
                  <a href="/login" class="text-white"><small>Voltar</small></a>
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
        password: '',
        password_confirmation: '',
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
          url: `users/password-reset/${this.$route.query.token}`,
          data: this.form,
        })

        const messageSent = resp.data

        if (messageSent) {
          this.info = 'Senha alterada com sucesso'
        } else {
          this.error = 'Não foi possível redefinir sua senha'
        }
      } catch (err) {
        this.error = err.response.data
      }

      this.is_sending = false
    },
  },
}
</script>
