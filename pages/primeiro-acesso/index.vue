<template>
  <div class="bg-brown-3 text-white text-center">
    <b-container>
      <b-row v-if="show_form" align-v="center" style="padding-top: 5em">
        <b-col md="6" offset-md="3">
          <div class="text-primary">
            <h1>IÊ</h1>
            <p>Inteligência econômica ecológica</p>
          </div>
          <b-card class="bg-brown-1 text-left">
            <b-card-body>
              <p>Insira seu CPF para continuar</p>
              <form class="form-auth-small" @submit.prevent="validateCPF">
                <div class="form-group">
                  <input
                    v-model="form.cpf"
                    v-mask="['###.###.###-##']"
                    type="text"
                    class="form-control"
                    placeholder="Seu CPF"
                  />
                </div>
                <div v-if="is_sending" class="alert alert-info">
                  <b-spinner small /> Verificando...
                </div>
                <div v-if="error" class="alert alert-danger">
                  {{ error }}
                </div>
                <button type="submit" class="btn btn-white btn-lg btn-block">
                  Continuar
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
      show_form: false,
      error: null,
      form: {
        cpf: '',
      },
    }
  },

  created() {
    if (this.$auth.loggedIn) {
      this.$router.push('/painel')
    } else {
      this.show_form = true
    }
  },

  methods: {
    async validateCPF() {
      this.is_sending = true
      this.error = null

      try {
        const cpf = this.form.cpf.replace(/\D/g, '')
        const resp = await this.$axios.post('users/validate-first-access', {
          cpf,
        })

        if (resp.data.valid) {
          console.log('Token:', resp.data.token)
          await this.$router.push(
            `/primeiro-acesso/${resp.data.token}/definir-senha`
          )
        } else {
          this.error = 'CPF não encontrado ou já possui senha definida'
        }
      } catch (err) {
        console.error('Navigation error:', err)
        this.error = err.response?.data || 'Erro ao validar CPF'
      }

      this.is_sending = false
    },
  },
}
</script>
