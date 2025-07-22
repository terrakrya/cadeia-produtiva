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
              <b-form-group label="Perfil *">
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
          <div v-if="isAdmin || isGlobalManager" class="row">
            <div
              v-if="
                currentUser.role === 'gestor-global' ||
                form.role === 'gestor' ||
                form.role === 'mensageiro'
              "
              class="col-sm-6"
            >
              <b-form-group label="Selecionar uma organização *">
                <b-form-select
                  v-model="form.organization"
                  class="form-control"
                  :options="organizationsOptions"
                />
              </b-form-group>
            </div>
          </div>

          <div class="form-row">
            <div class="col-md-4 col-sm-12">
              <b-form-group label="Nome *">
                <b-form-input
                  v-model="form.name"
                  v-validate="'required'"
                  name="name"
                  placeholder="Digite o nome"
                />
                <field-error :msg="veeErrors" field="name" />
              </b-form-group>
            </div>
            <div class="col-md-3 col-sm-12">
              <b-form-group label="Gênero">
                <b-form-select
                  v-model="form.gender"
                  class="form-control"
                  :options="genero"
                />
              </b-form-group>
            </div>
            <div class="col-md-2 col-sm-12">
              <b-form-group label="Nascimento">
                <b-form-input
                  v-model="form.birthDate"
                  v-mask="['##/##/####']"
                  placeholder="DD/MM/AAAA"
                />
              </b-form-group>
            </div>
            <div class="col-md-3 col-sm-12">
              <b-form-group label="E-mail *">
                <b-form-input
                  v-model="form.email"
                  v-validate="'required'"
                  name="email"
                  placeholder="Digite o e-mail"
                />
                <field-error :msg="veeErrors" field="email" />
              </b-form-group>
            </div>
          </div>

          <div class="form-row">
            <div class="col-md-3 col-sm-12">
              <b-form-group label="Celular *">
                <b-form-input
                  v-model="form.cellphone"
                  v-validate="'required'"
                  v-mask="['(##) #####-####']"
                  name="cellphone"
                  placeholder="Digite o celular"
                />
                <field-error :msg="veeErrors" field="cellphone" />
              </b-form-group>
            </div>
            <div class="col-md-3 col-sm-12">
              <b-form-group label="CPF *">
                <b-form-input
                  v-model="form.cpf"
                  v-validate="'required'"
                  v-mask="['###.###.###-##']"
                  name="cpf"
                  placeholder="Digite o CPF"
                />
                <field-error :msg="veeErrors" field="cpf" />
              </b-form-group>
            </div>
            <div class="col-md-3 col-sm-12">
              <b-form-group label="Estado de Atuação *">
                <b-form-select
                  v-model="form.uf"
                  class="form-control"
                  :options="estados.map((e) => e.uf)"
                  name="uf"
                  @input="loadCities"
                >
                  <option :value="null" disabled>Selecione um Estado</option>
                </b-form-select>
                <field-error :msg="veeErrors" field="uf" />
              </b-form-group>
            </div>
            <div class="col-md-3 col-sm-12">
              <b-form-group label="Município de Referência *">
                <b-form-select
                  v-model="form.city"
                  class="form-control"
                  :options="cidades"
                  name="city"
                  @input="loadRegions()"
                >
                </b-form-select>
                <field-error :msg="veeErrors" field="region" />
              </b-form-group>
            </div>
          </div>

          <div v-if="showPasswordFields && isEditing()" class="form-row">
            <div class="col-md-6 col-sm-12">
              <b-form-group label="Senha">
                <b-form-input
                  v-model="form.password"
                  type="password"
                  name="password"
                  placeholder="Digite a senha"
                />
                <field-error :msg="veeErrors" field="password" />
              </b-form-group>
            </div>
            <div class="col-md-6 col-sm-12">
              <b-form-group label="Confirmação de senha">
                <b-form-input
                  v-model="form.password_confirmation"
                  type="password"
                  name="password_confirmation"
                  placeholder="Confirme a senha"
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
import genero from '@/data/generos.json'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import regioes from '@/data/regioes-castanheiras.json'

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      estados,
      cidades,
      regioes,
      genero,
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

    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }

    await this.list()
  },
  methods: {
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
    async edit(id) {
      this.is_loading = true;
      try {
        const response = await this.$axios.get(`users/${id}`);
        const existingData = response.data;
        
        this.form = {
          ...this.form,
          ...existingData,
          regionId: existingData.regionId,
          password: '',
          password_confirmation: '',
          cellphone: this.formatPhoneNumber(existingData.cellphone)
        };
        
        if (existingData.uf) {
          this.loadCities();
        }
        if (existingData.city) {
          this.loadRegions();
        }
      } catch (error) {
        this.showError(error);
      } finally {
        this.is_loading = false;
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
          else if (!this.form.region) {
            this.veeErrors.items.push({
              id: 106,
              vmId: this.veeErrors.vmId,
              field: 'region',
              msg: 'Município não vinculado a um Território.',
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
    loadRegions() {
      const [regionName] = [
        ...new Set(
          regioes
            .filter((item) => item.municipio == this.form.city)
            .map((item) => item.regiaoCastanheira)
        ),
      ]

      this.form.region = regionName
      
      if (regionName && this.form.uf && this.form.city) {
        this.findRegionId(regionName, this.form.uf, this.form.city)
      } else {
        this.form.regionId = null
      }
    },
    async findRegionId(regionName, uf, city) {
      try {
        const response = await this.$axios.$get('regions', {
          params: {
            name: regionName
          }
        })
        
        if (response && response.length > 0) {
          const matchingRegion = response.find(region => 
            region.municipalities && region.municipalities.some(municipality => 
              municipality.name === city && municipality.uf === uf
            )
          )
          
          if (matchingRegion) {
            this.form.regionId = matchingRegion._id
          } else {
            this.form.regionId = response[0]._id
          }
        } else {
          this.form.regionId = null
        }
      } catch (error) {
        console.warn('Erro ao buscar regionId:', error)
        this.form.regionId = null
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
      return number.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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
