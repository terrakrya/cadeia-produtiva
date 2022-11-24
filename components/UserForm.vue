<template>
  <div class="user_form">
    <breadcrumb
      :links="[['Cadastro', '/cadastros/usuarios']]"
      active="Usuário"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Usuário" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label=" Perfil *">
                <b-form-radio-group
                  v-model="form.role"
                  v-validate="'required'"
                  :options="tiposDeUsuarioPermitidos"
                  name="role"
                />
                <field-error :msg="veeErrors" field="role" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label="Nome *">
                <b-form-input
                  v-model="form.name"
                  v-validate="'required'"
                  name="name"
                />
                <field-error :msg="veeErrors" field="name" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="E-mail *">
                <b-form-input v-model="form.email" name="email" />
                <field-error :msg="veeErrors" field="email" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="Celular *">
                <b-form-input
                  v-model="form.username"
                  v-validate="'required'"
                  v-mask="['(##) #####-####']"
                  name="username"
                />
                <field-error :msg="veeErrors" field="username" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="CPF *">
                <b-form-input
                  v-model="form.cpf"
                  v-validate="'required'"
                  v-mask="['###.###.###-##']"
                  name="cpf"
                />
                <field-error :msg="veeErrors" field="cpf" />
              </b-form-group>
            </div>
            <div v-if="isEditing()" class="text-right">
              <a class="pointer" @click="changePassword">{{
                'Mude sua senha'
              }}</a>
            </div>
          </div>
          <div v-if="showPasswordFields" class="row">
            <div class="col-sm-6">
              <b-form-group label="Senha">
                <b-form-input
                  v-model="form.password"
                  type="password"
                  name="password"
                />
                <field-error :msg="veeErrors" field="password" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="Confirmar senha">
                <b-form-input
                  v-model="form.password_confirmation"
                  type="password"
                  name="password_confirmation"
                />
                <field-error :msg="veeErrors" field="password_confirmation" />
              </b-form-group>
            </div>
          </div>
          <form-submit :sending="is_sending" />
        </b-form>
      </div>
    </div>
  </div>
</template>
<script>
import Breadcrumb from '@/components/Breadcrumb'
import tiposDeUsuario from '@/data/tipos-de-usuario.json'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      show_password: false,
      tiposDeUsuarioPermitidos: [],
      form: {
        username: '',
        name: '',
        email: '',
        cpf: '',
        password: '',
        password_confirmation: '',
        role: null,
      },
    }
  },
  computed: {
    showPasswordFields() {
      return !this.isEditing() || this.show_password
    },
  },
  created() {
    this.tiposDeUsuarioPermitidos = tiposDeUsuario
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
  },
  methods: {
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('users/' + id)
        .then((response) => {
          this.apiDataToForm(this.form, response.data)
          if (response.data.image) {
            this.images_preview = [response.data.image]
          }
          this.is_loading = false
        })
        .catch(this.showError)
    },
    save() {
      this.$validator.validate().then(async (isValid) => {
        // valida a email
        if (this.form.email) {
          const id = this.isEditing() ? this.$route.params.id : null

          // formato do email
          if (!/\S+@\S+\.\S+/.test(this.form.email)) {
            this.veeErrors.items.push({
              id: 102,
              vmId: this.veeErrors.vmId,
              field: 'email',
              msg: 'Email com formato inválido.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
          // unicidade do email
          else if (await this.isNotUniqueEmail(id, this.form.email)) {
            this.veeErrors.items.push({
              id: 103,
              vmId: this.veeErrors.vmId,
              field: 'email',
              msg: 'Este email já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
          // unicidade do cpf
          else if (await this.isNotUniqueCpf(id, this.form.cpf)) {
            this.veeErrors.items.push({
              id: 104,
              vmId: this.veeErrors.vmId,
              field: 'cpf',
              msg: 'Este CPF já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
          // unicidade do celular
          else if (await this.isNotUniqueUsername(id, this.form.username)) {
            this.veeErrors.items.push({
              id: 105,
              vmId: this.veeErrors.vmId,
              field: 'username',
              msg: 'Este celular já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          } else {
            this.veeErrors.items = this.veeErrors.items.filter(
              (error) =>
                error.id !== 102 &&
                error.id !== 103 &&
                error.id !== 104 &&
                error.id !== 105
            )
          }
        }

        if (isValid) {
          this.is_sending = true

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing() ? 'users/' + this.$route.params.id : 'users',
            data: this.form,
          })
            .then((resp) => {
              const user = resp.data
              if (user && user._id) {
                if (user._id === this.currentUser._id) {
                  this.$auth.setUser(user)
                }

                this.notify('Usuário salvo com sucesso')
                this.$router.replace('/cadastros/usuarios')
              }
              this.is_sending = false
            })
            .catch(this.showError)
        }
      })
    },
    changePassword() {
      this.show_password = !this.show_password
    },
    async isNotUniqueEmail(id, email) {
      return !(await this.$axios.$post('users/unique-email', { id, email }))
    },
    async isNotUniqueCpf(id, cpf) {
      return !(await this.$axios.$post('users/unique-cpf', { id, cpf }))
    },
    async isNotUniqueUsername(id, username) {
      return !(await this.$axios.$post('users/unique-username', {
        id,
        username,
      }))
    },
  },
}
</script>
<style scoped>
.checkbox-container {
  margin-top: 2em;
}

.custom-checkbox {
  width: 100%;
}
</style>
