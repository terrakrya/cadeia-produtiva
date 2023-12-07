<template>
  <div class="user-form">
    <breadcrumb active="Minha conta" />
    <div class="panel">
      <div class="panel-body">
        <loading :loading="is_loading" />
        <b-tabs>
          <b-tab title="Meu perfil">
            <b-form v-if="!is_loading" @submit.prevent="save">
              <h4 class="mb-4">Complete seu perfil</h4>
              <b-row>
                <b-col class="col-sm-3">
                  <b-form-group label="Nome Completo *">
                    <b-form-input
                      v-model="form.name"
                      v-validate="'required'"
                      name="name"
                    />
                    <field-error :msg="veeErrors" field="name" />
                  </b-form-group>
                </b-col>
                <div class="col-sm-2">
                  <b-form-group label="Data de nascimento *">
                    <b-form-input
                      v-model="form.birthDate"
                      v-mask="'##/##/####'"
                      name="birthDate"
                    />
                  </b-form-group>
                </div>
                <div class="col-sm-2">
                  <b-form-group label="Apelido ">
                    <b-form-input v-model="form.nickname" />
                  </b-form-group>
                </div>
                <b-col sm="3">
                  <b-form-group label="E-mail *">
                    <b-form-input v-model="form.email" name="email" />
                    <field-error :msg="veeErrors" field="email" />
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <div class="col-sm-2">
                  <b-form-group label="Gênero ">
                    <b-form-select v-model="form.gender" :options="genero" />
                  </b-form-group>
                </div>
                <div class="col-sm-2">
                  <b-form-group label="Identidade ">
                    <b-form-select
                      v-model="form.identity"
                      :options="identidade"
                    />
                  </b-form-group>
                </div>
                <div class="col-sm-2">
                  <b-form-group label="Celular *">
                    <b-form-input
                      v-model="form.username"
                      v-mask="'(##) #####-####'"
                      v-validate="'required'"
                      name="username"
                    />
                  </b-form-group>
                </div>
                <b-col class="col-sm-2">
                  <b-form-group label="CPF *">
                    <b-form-input
                      v-model="form.cpf"
                      v-mask="['###.###.###-##']"
                      v-validate="'required'"
                      name="cpf"
                    />
                  </b-form-group>
                </b-col>
              </b-row>
              <div class="row">
                <b-col sm="3">
                  <b-form-group label="Posição na cadeia de valor *">
                    <b-form-select
                      v-model="form.buyerPosition"
                      v-validate="'required'"
                      class="form-control"
                      name="buyerPosition"
                      :options="buyerPositions"
                    />
                    <field-error :msg="veeErrors" field="buyerPosition" />
                  </b-form-group>
                </b-col>
                <div class="col-sm-2">
                  <b-form-group label="País *">
                    <b-form-select
                      v-model="form.country"
                      v-validate="'required'"
                      class="form-control"
                      :options="pais"
                      name="country"
                    />
                    <field-error :msg="veeErrors" field="country" />
                  </b-form-group>
                </div>
                <b-col sm="2">
                  <b-form-group label="Estado de Atuação *">
                    <b-form-select
                      v-model="form.uf"
                      v-validate="'required'"
                      class="form-control"
                      :options="estados.map((e) => e.uf)"
                      name="uf"
                      @input="loadCities()"
                    />
                    <field-error :msg="veeErrors" field="uf" />
                  </b-form-group>
                </b-col>
                <b-col sm="2">
                  <b-form-group label="Município de Referência *">
                    <b-form-select
                      v-model="form.city"
                      v-validate="'required'"
                      class="form-control"
                      :options="cidades"
                      name="city"
                    />
                    <field-error :msg="veeErrors" field="city" />
                  </b-form-group>
                </b-col>
              </div>
              <div class="row">
                <b-col sm="2">
                  <b-form-group label="Unidade de medida mais comum *">
                    <b-form-select
                      v-model="form.unitOfMeasurement"
                      v-validate="'required'"
                      class="form-control"
                      name="unitOfMeasurement"
                      :options="tipoDeUnidade"
                    />
                    <field-error :msg="veeErrors" field="unitOfMeasurement" />
                  </b-form-group>
                </b-col>
                <div class="col-sm-1">
                  <b-form-group label="Moeda *">
                    <b-form-select
                      v-model="form.currency"
                      v-validate="'required'"
                      false-value="Real"
                      class="form-control"
                      :options="moeda"
                      name="currency"
                    />
                    <field-error :msg="veeErrors" field="currency" />
                  </b-form-group>
                </div>
              </div>
              <form-submit :sending="is_sending" />
            </b-form>
          </b-tab>
          <b-tab title="Alterar Senha">
            <h4 class="mb-4">Alterar senha</h4>
            <b-form v-if="!is_loading" @submit.prevent="save">
              <b-row>
                <b-col md="6">
                  <b-form-group label="Senha">
                    <b-form-input
                      v-model="form.password"
                      type="password"
                      name="pass"
                    />
                    <field-error :msg="veeErrors" field="pass" />
                  </b-form-group>
                </b-col>
                <b-col md="6">
                  <b-form-group label="Confirmação de senha">
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
import pais from '@/data/pais.json'
import moeda from '@/data/moeda.json'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import genero from '@/data/generos.json'
import identidade from '@/data/identidade-cultural.json'

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      identidade,
      genero,
      tipoDeUnidade,
      buyerPositions,
      pais,
      moeda,
      estados,
      cidades,
      form: {
        unitOfMeasurement: '',
        name: '',
        email: '',
        username: '',
        cpf: '',
        password: '',
        password_confirmation: '',
        buyerPosition: '',
        currency: 'real',
        country: 'BR',
        nickname: '',
        uf: '',
        city: '',
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
    loadCities() {
      // lista de cidades com somente o item "selecione a cidade"
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]

      // filtra as cidades conforme a UF selecionada
      if (this.form.uf) {
        this.cidades = this.cidades.concat(Object(cidades)[this.form.uf])
      }

      // limpa a cidade digitada, caso não exista na lista
      if (this.form.city && this.cidades) {
        if (!this.cidades.find((c) => c === this.form.city)) {
          this.form.city = ''
        }
      }
    },
    async edit(id) {
      this.is_loading = true
      try {
        const dados = await this.$axios.$get('users/' + id)

        this.form.unitOfMeasurement = dados.unitOfMeasurement
        this.form.name = dados.name
        this.form.email = dados.email
        this.form.username = dados.username
        this.form.cpf = dados.cpf
        this.form.password = dados.password
        this.form.password_confirmation = dados.password_confirmation
        this.form.buyerPosition = dados.buyerPosition
        this.form.birthDate = dados.birthDate
        if (dados.currency) {
          this.form.currency = dados.currency
        }
        if (dados.country) {
          this.form.country = dados.country
        }

        this.form.nickname = dados.nickname
        this.form.uf = dados.uf
        this.loadCities()
        this.form.city = dados.city
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

    async isNotUniqueCpf(id, cpf) {
      return !(await this.$axios.$post('users/unique-cpf', { id, cpf }))
    },

    async isNotUniqueUsername(id, username) {
      return !(await this.$axios.$post('users/unique-username', {
        id,
        username,
      }))
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
          // unicidade do CPF
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
          // unicidade do CPF
          else if (await this.isNotUniqueUsername(id, this.form.username)) {
            this.veeErrors.items.push({
              id: 105,
              vmId: this.veeErrors.vmId,
              field: 'username',
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

          // deixa somente os dígitos do telefone
          this.form.username = this.form.username.replace(/\D/g, '')

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
