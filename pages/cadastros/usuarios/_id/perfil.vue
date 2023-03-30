<template>
  <div class="user-form">
    <breadcrumb active="Minha conta" />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Minha conta" />
        <loading :loading="is_loading" />
        <b-form v-if="!is_loading" @submit.prevent="save">
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Unidade de medida">
                <b-form-select
                  v-model="form.unitOfMeasurement"
                  class="form-control"
                  name="unitOfMeasurement"
                  :options="tipoDeUnidade"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group label="Posição na cadeia de valor">
                <b-form-select
                  v-model="form.buyerPosition"
                  class="form-control"
                  name="buyerPosition"
                  :options="buyerPositions"
                />
              </b-form-group>
            </b-col>
          </div>
          <b-row>
            <b-col>
              <b-form-group label="Nome *">
                <b-form-input
                  v-model="form.name"
                  v-validate="'required'"
                  name="name"
                />
                <field-error :msg="veeErrors" field="name" />
              </b-form-group>
            </b-col>
            <div class="col-sm-4">
              <b-form-group label="Apelido ">
                <b-form-input v-model="form.nickname" />
              </b-form-group>
            </div>
            <b-col>
              <b-form-group label="E-mail *">
                <b-form-input v-model="form.email" name="email" />
                <field-error :msg="veeErrors" field="email" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <div class="col-sm-2">
              <b-form-group label="Gênero ">
                <b-form-select
                  v-model="form.gender"
                  :options="genero"
                />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="Celular *">
                <b-form-input
                  v-model="form.username"
                  v-mask="'(##) #####-####'"
                  v-validate="'required'"
                  name="username"
                />
              </b-form-group>
            </div>
            <b-col>
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
            <div class="col-sm-4">
              <b-form-group label="Moeda">
                <b-form-select
                  v-model="form.currency"
                  false-value="Real"
                  class="form-control"
                  :options="moeda"
                />
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group label="País">
                <b-form-select
                  v-model="form.country"
                  class="form-control"
                  :options="pais"
                />
              </b-form-group>
            </div>
          </div>
          <b-row>
            <b-col sm="4">
              <b-form-group label="Estado">
                <b-form-select
                  v-model="form.uf"
                  v-validate="'required'"
                  class="form-control"
                  :options="estados"
                  name="uf"
                  @input="loadCities()"
                />
                <field-error :msg="veeErrors" field="uf" />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Cidade">
                <b-form-select
                  v-model="form.city"
                  class="form-control"
                  :options="cidades"
                  name="city"
                />
                <field-error :msg="veeErrors" field="city" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-group label="Senha">
                <b-form-input
                  v-model="form.password"
                  type="password"
                  name="pass"
                />
                <field-error :msg="veeErrors" field="pass" />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Confirmar senha">
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

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
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
      },
    }
  },
  created() {
    this.edit(this.$route.params.id)
    this.loadCities()
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
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('users/' + id)
        .then((response) => {
          this.apiDataToForm(this.form, response.data)
          this.is_loading = false
        })
        .catch(this.showError)
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
          
          if (this.isAdmin) {
            this.form.username = 'admin'
          }

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
