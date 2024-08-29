<template>
  <div class="user-form">
    <breadcrumb active="Minha conta" />
    <div class="panel">
      <div class="panel-body">
        <loading :loading="is_loading" />
        <b-tabs v-model="activeTabKey">
          <b-tab title="Meu perfil">
            <b-form v-if="!is_loading" @submit.prevent="save">
              <h4 class="mb-4">Complete seu perfil</h4>
              <b-row>
                <b-col sm="4">
                  <b-form-group label="Nome Completo *">
                    <b-form-input
                      v-model="form.name"
                      v-validate="getValidationRules('name')"
                      placeholder="Insira o seu nome completo"
                      name="name"
                    />
                    <field-error :msg="veeErrors" field="name" />
                  </b-form-group>
                </b-col>
                <b-col sm="4">
                  <b-form-group label="Data de nascimento *">
                    <b-form-input
                      v-model="form.birthDate"
                      v-mask="'##/##/####'"
                      v-validate="getValidationRules('birthDate')"
                      placeholder="Insira sua data de nascimento"
                      name="birthDate"
                    />
                    <field-error :msg="veeErrors" field="birthDate" />
                  </b-form-group>
                </b-col>
                <b-col sm="4">
                  <b-form-group label="Apelido">
                    <b-form-input
                      v-model="form.nickname"
                      placeholder="Insira o seu apelido"
                    />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col sm="6">
                  <b-form-group label="E-mail *">
                    <b-form-input
                      v-model="form.email"
                      v-validate="getValidationRules('email')"
                      placeholder="Insira seu email"
                      name="email"
                    />
                    <field-error :msg="veeErrors" field="email" />
                  </b-form-group>
                </b-col>
                <b-col sm="3">
                  <b-form-group label="Gênero">
                    <b-form-select
                      v-model="form.gender"
                      :options="genero"
                      class="form-control"
                    />
                  </b-form-group>
                </b-col>
                <b-col sm="3">
                  <b-form-group label="Celular *">
                    <b-form-input
                      v-model="form.cellphone"
                      v-mask="['(##) ####-####', '(##) #####-####']"
                      v-validate="getValidationRules('cellphone')"
                      placeholder="Insira seu número de celular"
                      name="cellphone"
                    />
                    <field-error :msg="veeErrors" field="cellphone" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col sm="6">
                  <b-form-group label="Identidade">
                    <b-form-select
                      v-model="form.identity"
                      class="form-control"
                      name="identity"
                      :options="identidade"
                    />
                  </b-form-group>
                </b-col>
                <b-col sm="6">
                  <b-form-group label="Posição na cadeia de valor *">
                    <b-form-select
                      v-model="form.buyerPosition"
                      v-validate="getValidationRules('buyerPosition')"
                      class="form-control"
                      name="buyerPosition"
                      :options="buyerPositions"
                    />
                    <field-error :msg="veeErrors" field="buyerPosition" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col sm="6">
                  <b-form-group label="Unidade de medida mais comum *">
                    <b-form-select
                      v-model="form.unitOfMeasurement"
                      v-validate="getValidationRules('unitOfMeasurement')"
                      class="form-control"
                      name="unitOfMeasurement"
                      :options="tipoDeUnidade"
                    />
                    <field-error :msg="veeErrors" field="unitOfMeasurement" />
                  </b-form-group>
                </b-col>
              </b-row>

              <form-submit :sending="is_sending" />
            </b-form>
          </b-tab>

          <b-tab title="Alterar Senha">
            <h4 class="mb-4">Alterar senha</h4>
            <b-form v-if="!is_loading" @submit.prevent="save">
              <b-row>
                <b-col md="6">
                  <b-form-group label="Insira a nova senha">
                    <b-form-input
                      v-model="form.password"
                      type="password"
                      name="pass"
                    />
                    <field-error :msg="veeErrors" field="pass" />
                  </b-form-group>
                </b-col>
                <b-col md="6">
                  <b-form-group label="Repita a nova senha">
                    <b-form-input
                      v-model="form.password_confirmation"
                      type="password"
                      name="pass_confirmation"
                    />
                    <field-error :msg="veeErrors" field="pass_confirmation" />
                  </b-form-group>
                </b-col>
              </b-row>
              <form-submit :sending="is_sending" />
            </b-form>
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import tipoDeUnidade from '@/data/tipo-de-unidade'
import buyerPositions from '@/data/posicao-do-comprador'
import genero from '@/data/generos.json'
import identidade from '@/data/identidade-cultural.json'

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      activeTabKey: 0,
      identidade,
      genero,
      tipoDeUnidade,
      buyerPositions,
      form: {
        unitOfMeasurement: '',
        name: '',
        email: '',
        username: '',
        cellphone: '',
        password: '',
        password_confirmation: '',
        buyerPosition: '',
        nickname: '',
        identity: '',
        gender: '',
        birthDate: '',
      },
    }
  },
  created() {
    this.edit(this.$route.params.id)
  },
  methods: {
    getValidationRules(fieldName) {
      if (this.activeTabKey !== 0) {
        return ''
      }

      const staticRules = {
        birthDate: 'min:10',
        cellphone: 'min:14',
      }

      const rules = ['required']
      if (staticRules[fieldName]) {
        rules.push(staticRules[fieldName])
      }

      return rules.join('|')
    },
    async edit(id) {
      this.is_loading = true
      try {
        const dados = await this.$axios.$get('users/' + id)

        this.form.unitOfMeasurement = dados.unitOfMeasurement
        this.form.name = dados.name
        this.form.email = dados.email
        this.form.username = dados.username
        this.form.cellphone = dados.cellphone
        this.form.password = dados.password
        this.form.password_confirmation = dados.password_confirmation
        this.form.buyerPosition = dados.buyerPosition
        this.form.birthDate = dados.birthDate

        this.form.nickname = dados.nickname
        this.form.identity = dados.identity
        this.form.gender = dados.gender
        this.form.birthDate = dados.birthDate
      } catch (e) {
        this.showError(e)
      }

      this.is_loading = false
    },

    async isNotUniqueEmail(id, email) {
      return !(await this.$axios.$post('users/unique-email', { id, email }))
    },

    async isNotUniqueCellphone(id, cellphone) {
      return !(await this.$axios.$post('users/unique-cellphone', {
        id,
        cellphone,
      }))
    },

    save() {
      this.$validator.validate().then(async (isValid) => {
        // valida a email
        if (this.form.email && this.activeTabKey === 0) {
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
          // unicidade do Celular
          else if (await this.isNotUniqueCellphone(id, this.form.cellphone)) {
            this.veeErrors.items.push({
              id: 105,
              vmId: this.veeErrors.vmId,
              field: 'cellphone',
              msg: 'Este Celular já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
        } else {
          this.veeErrors.items = this.veeErrors.items.filter(
            (error) =>
              error.id !== 102 &&
              error.id !== 103 &&
              error.id !== 104 &&
              error.id !== 105
          )
        }

        if (isValid) {
          this.is_sending = true

          this.$axios({
            method: 'PUT',
            url: 'users/' + this.$route.params.id + '/profile',
            data: this.form,
          })
            .then((resp) => {
              const user = resp.data

              if (user && user._id) {
                if (user._id === this.currentUser._id) {
                  this.$auth.setUser(user)
                }

                this.notify('Dados salvos com sucesso')

                this.$router.push('/')
              }

              this.is_sending = false
            })
            .catch(this.showError)
        }
      })
    },
  },
}
</script>
