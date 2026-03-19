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
          <div v-if="isAdmin || isGlobalManager" class="form-row">
            <div class="col-md-12">
              <b-form-group label="Perfil *" label-for="input-role">
                <b-form-radio-group
                  id="input-role"
                  v-model="form.role"
                  v-validate="'required'"
                  :options="tiposDeUsuarioPermitidos"
                  name="role"
                  aria-describedby="error-role"
                />
                <field-error :msg="veeErrors" field="role" />
              </b-form-group>
            </div>
          </div>
          <div v-if="isAdmin || isGlobalManager" class="row">
            <div
              v-if="
                currentUser.role === 'gestor-global' ||
                form.role === 'gestor' ||
                form.role === 'mensageiro'
              "
              class="col-sm-6"
            >
              <div class="form-group">
                <label for="input-organization">Selecionar uma organização *</label>
                <b-form-select
                  id="input-organization"
                  v-model="form.organization"
                  class="form-control"
                  :options="organizationsOptions"
                  @input="onOrganizationChange"
                />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="col-md-4 col-sm-12">
              <div class="form-group">
                <label for="input-name">Nome *</label>
                <b-form-input
                  id="input-name"
                  v-model="form.name"
                  v-validate="'required'"
                  name="name"
                  placeholder="Digite o nome"
                  aria-describedby="error-name"
                />
                <field-error :msg="veeErrors" field="name" />
              </div>
            </div>
            <div class="col-md-3 col-sm-12">
              <div class="form-group">
                <label for="input-gender">Gênero</label>
                <b-form-select
                  id="input-gender"
                  v-model="form.gender"
                  class="form-control"
                  :options="genero"
                />
              </div>
            </div>
            <div class="col-md-2 col-sm-12">
              <div class="form-group">
                <label for="input-birthDate">Nascimento</label>
                <b-form-input
                  id="input-birthDate"
                  v-model="form.birthDate"
                  v-mask="['##/##/####']"
                  placeholder="DD/MM/AAAA"
                />
              </div>
            </div>
            <div class="col-md-3 col-sm-12">
              <div class="form-group">
                <label for="input-email">E-mail *</label>
                <b-form-input
                  id="input-email"
                  v-model="form.email"
                  v-validate="'required'"
                  name="email"
                  placeholder="Digite o e-mail"
                  aria-describedby="error-email"
                />
                <field-error :msg="veeErrors" field="email" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="col-md-3 col-sm-12">
              <div class="form-group">
                <label for="input-cellphone">Celular *</label>
                <b-form-input
                  id="input-cellphone"
                  v-model="form.cellphone"
                  v-validate="'required'"
                  v-mask="['(##) #####-####']"
                  name="cellphone"
                  placeholder="Digite o celular"
                  aria-describedby="error-cellphone"
                />
                <field-error :msg="veeErrors" field="cellphone" />
              </div>
            </div>
            <div class="col-md-3 col-sm-12">
              <div class="form-group">
                <label for="input-cpf">CPF *</label>
                <b-form-input
                  id="input-cpf"
                  v-model="form.cpf"
                  v-validate="'required'"
                  v-mask="['###.###.###-##']"
                  name="cpf"
                  placeholder="Digite o CPF"
                  aria-describedby="error-cpf"
                />
                <field-error :msg="veeErrors" field="cpf" />
              </div>
            </div>
            <div class="col-md-3 col-sm-12">
              <div class="form-group">
                <label for="input-uf">Estado de Atuação *</label>
                <b-form-select
                  id="input-uf"
                  v-model="form.uf"
                  class="form-control"
                  :options="estados"
                  name="uf"
                  aria-describedby="error-uf"
                  @input="loadCities"
                >
                  <option :value="null" disabled>Selecione um Estado</option>
                </b-form-select>
                <small v-if="loadingLocation" class="text-muted">
                  Carregando estados e municípios válidos...
                </small>
                <field-error :msg="veeErrors" field="uf" />
              </div>
            </div>
            <div class="col-md-3 col-sm-12">
              <div class="form-group">
                <label for="input-city">Município de Referência *</label>
                <b-form-select
                  id="input-city"
                  v-model="form.city"
                  class="form-control"
                  :options="cidades"
                  name="city"
                  aria-describedby="error-region"
                  :disabled="!form.uf || loadingLocation"
                  @input="onCityChange"
                >
                </b-form-select>
                <field-error :msg="veeErrors" field="region" />
              </div>
            </div>
          </div>

          <div v-if="showPasswordFields && isEditing()" class="form-row">
            <div class="col-md-6 col-sm-12">
              <div class="form-group">
                <label for="input-password">Senha</label>
                <b-form-input
                  id="input-password"
                  v-model="form.password"
                  type="password"
                  name="password"
                  placeholder="Digite a senha"
                  aria-describedby="error-password"
                />
                <field-error :msg="veeErrors" field="password" />
              </div>
            </div>
            <div class="col-md-6 col-sm-12">
              <div class="form-group">
                <label for="input-password_confirmation">Confirmação de senha</label>
                <b-form-input
                  id="input-password_confirmation"
                  v-model="form.password_confirmation"
                  type="password"
                  name="password_confirmation"
                  placeholder="Confirme a senha"
                  aria-describedby="error-password_confirmation"
                />
                <field-error :msg="veeErrors" field="password_confirmation" />
              </div>
            </div>
          </div>
          <form-submit :sending="is_sending" />
          <div v-if="isEditing() && (isAdmin || isGlobalManager)" class="row mt-2">
            <div class="col-sm-12 text-center">
              <button
                type="button"
                class="btn btn-lg rounded-pill btn-outline-danger btn-block"
                :disabled="is_resetting"
                @click="resetFirstAccess"
              >
                <span v-if="is_resetting"><b-spinner small /> Redefinindo...</span>
                <span v-else>Redefinir Senha</span>
              </button>
            </div>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>
<script>
import Breadcrumb from '@/components/Breadcrumb'
import genero from '@/data/generos.json'

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      estados: [],
      cidades: [{ value: '', text: 'Selecione a cidade' }],
      municipalitiesByUf: {},
      regionMatchesByMunicipality: {},
      genero,
      loadingLocation: false,
      is_resetting: false,
      show_password: false,
      tiposDeUsuarioPermitidos: [],
      organizationsOptions: [],
      form: {
        username: '',
        name: '',
        email: '',
        cellphone: '',
        cpf: '',
        uf: null,
        city: '',
        region: '',
        regionId: null,
        role: null,
        organization: '',
        birthDate: '',
        gender: '',
        password: '',
        password_confirmation: '',
      },
    }
  },
  computed: {
    showPasswordFields() {
      return !this.isEditing() || this.isAdmin || this.show_password
    },
  },
  async created() {
    this.tiposDeUsuarioPermitidos = [
      { text: 'Gestor', value: 'gestor' },
      { text: 'Mensageiro', value: 'mensageiro' },
    ]

    if (this.isAdmin) {
      this.tiposDeUsuarioPermitidos.unshift({
        text: 'Gestor Global',
        value: 'gestor-global',
      })
    }

    await this.list()

    if (this.isEditing()) {
      await this.edit(this.$route.params.id)
    } else if (this.isManager) {
      this.form.organization = this.currentUser.organization || ''
    }

    await this.loadValidLocations()
    this.loadCities()
    this.resolveRegionForSelectedLocation()
  },
  methods: {
    getEffectiveOrganizationId() {
      if (this.isManager) {
        return this.currentUser.organization || null
      }

      if (this.form.role === 'gestor-global') {
        return null
      }

      return this.form.organization || null
    },
    getMunicipalityKey(city, uf) {
      return `${String(city || '').trim().toLowerCase()}::${String(uf || '')
        .trim()
        .toUpperCase()}`
    },
    async onOrganizationChange() {
      this.form.uf = null
      this.form.city = ''
      this.form.region = ''
      this.form.regionId = null
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]
      await this.loadValidLocations()
    },
    async list() {
      try {
        const organizationsData = await this.$axios.$get('organizations')
        this.organizationsOptions = [
          { value: '', text: 'Selecione uma organização' },
        ].concat(
          organizationsData.map((organization) => ({
            value: organization._id,
            text: organization.name,
          }))
        )
      } catch (error) {
        console.error('Erro ao carregar organização:', error)
      }
    },
    async loadValidLocations() {
      this.loadingLocation = true
      this.estados = []
      this.municipalitiesByUf = {}
      this.regionMatchesByMunicipality = {}

      try {
        const organizationId = this.getEffectiveOrganizationId()
        const params = {}

        if (organizationId) {
          params.organizationId = organizationId
        }

        const response = await this.$axios.$get('regions/municipalities/valid', {
          params,
        })
        const options = Array.isArray(response.options) ? response.options : []
        const regionMatches = Array.isArray(response.regionMatches)
          ? response.regionMatches
          : []

        this.estados = options
          .map((option) => option.uf)
          .sort((a, b) => a.localeCompare(b, 'pt-BR'))

        this.municipalitiesByUf = options.reduce((acc, option) => {
          acc[option.uf] = option.municipalities || []
          return acc
        }, {})

        this.regionMatchesByMunicipality = regionMatches.reduce((acc, item) => {
          const key = this.getMunicipalityKey(item.city, item.uf)
          acc[key] = item.regions || []
          return acc
        }, {})

        if (response.message) {
          this.notify(response.message, 'warning')
        }

        if (this.form.uf && !this.estados.includes(this.form.uf)) {
          this.form.uf = null
          this.form.city = ''
          this.form.region = ''
          this.form.regionId = null
        }
      } catch (error) {
        this.estados = []
        this.municipalitiesByUf = {}
        this.cidades = [{ value: '', text: 'Selecione a cidade' }]
        this.regionMatchesByMunicipality = {}
        this.form.region = ''
        this.form.regionId = null
        const message =
          error.response?.data?.message ||
          'Erro ao carregar municípios válidos para a organização selecionada.'
        this.notify(message, 'error')
      } finally {
        this.loadingLocation = false
      }
    },
    async edit(id) {
      this.is_loading = true
      try {
        const response = await this.$axios.get(`users/${id}`)
        const existingData = response.data

        this.form = {
          ...this.form,
          ...existingData,
          regionId: existingData.regionId,
          password: '',
          password_confirmation: '',
          cellphone: existingData.cellphone
            ? this.formatPhoneNumber(existingData.cellphone)
            : '',
        }
      } catch (error) {
        this.showError(error)
      } finally {
        this.is_loading = false
      }
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
          else if (await this.isNotUniqueCellphone(id, this.form.cellphone)) {
            this.veeErrors.items.push({
              id: 105,
              vmId: this.veeErrors.vmId,
              field: 'cellphone',
              msg: 'Este celular já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
          // possui Region
          else if (!this.form.region || !this.form.regionId) {
            this.veeErrors.items.push({
              id: 106,
              vmId: this.veeErrors.vmId,
              field: 'region',
              msg: 'Município não vinculado a uma região válida para a organização.',
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
                error.id !== 105 &&
                error.id !== 106
            )
          }
        }

        if (isValid) {
          this.is_sending = true

          if (this.isManager) {
            this.form.role = 'mensageiro'
            this.form.organization = this.currentUser.organization
          }
          if (this.form.role === 'gestor-global') {
            this.form.organization = null
          }

          // deixa somente os dígitos do CPF
          this.form.username = this.form.cpf.replace(/\D/g, '')

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
    loadCities() {
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]

      if (this.form.uf) {
        const cities = this.municipalitiesByUf[this.form.uf] || []
        this.cidades = this.cidades.concat(
          [...cities].sort((a, b) => a.localeCompare(b, 'pt-BR'))
        )
      }

      if (this.form.city && this.cidades.length > 1) {
        if (!this.cidades.find((c) => c === this.form.city)) {
          this.form.city = ''
          this.form.region = ''
          this.form.regionId = null
        }
      }
      this.resolveRegionForSelectedLocation()
    },
    onCityChange() {
      this.resolveRegionForSelectedLocation()
    },
    resolveRegionForSelectedLocation() {
      if (!this.form.uf || !this.form.city) {
        this.form.region = ''
        this.form.regionId = null
        return
      }

      const key = this.getMunicipalityKey(this.form.city, this.form.uf)
      const regions = this.regionMatchesByMunicipality[key] || []

      if (!regions.length) {
        this.form.region = ''
        this.form.regionId = null
        return
      }

      this.form.region = regions[0].name
      this.form.regionId = regions[0]._id

      if (regions.length > 1) {
        this.notify(
          'Município vinculado a múltiplas regiões. A primeira região disponível foi selecionada automaticamente.',
          'warning'
        )
      }
    },
    async resetFirstAccess() {
      const confirmed = window.confirm(
        'Tem certeza que deseja redefinir a senha deste usuário?\n\nEle perderá o acesso atual e precisará criar uma nova senha pelo fluxo de Primeiro Acesso (usando o CPF).'
      )
      if (!confirmed) return

      this.is_resetting = true
      try {
        const response = await this.$axios.$put(
          `users/${this.$route.params.id}/reset-first-access`
        )
        this.notify(response.message || 'Senha resetada com sucesso.')
      } catch (error) {
        const message =
          error.response?.data?.message ||
          'Ocorreu um erro ao resetar a senha do usuário.'
        this.notify(message, 'error')
      } finally {
        this.is_resetting = false
      }
    },
    changePassword() {
      this.show_password = !this.show_password
    },
    async isNotUniqueCpf(id, cpf) {
      return !(await this.$axios.$post('users/unique-cpf', { id, cpf }))
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
    formatPhoneNumber(number) {
      return number.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
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
