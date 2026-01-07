<template>
  <div class="organization-form">
    <Breadcrumb
      :links="[['Cadastro', '/cadastros/organizacoes']]"
      active="Organização"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Organização" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-5">
              <div class="form-group">
                <label for="input-name">Nome *</label>
                <b-form-input
                  id="input-name"
                  v-model="form.name"
                  v-validate="'required'"
                  name="name"
                />
                <field-error :msg="veeErrors" field="name" />
              </div>
            </div>
            <div class="col-sm-2">
              <div class="form-group">
                <label for="input-sigla">Sigla *</label>
                <b-form-input
                  id="input-sigla"
                  v-model="form.sigla"
                  v-validate="'required'"
                  name="sigla"
                />
                <field-error :msg="veeErrors" field="sigla" />
              </div>
            </div>
            <b-col sm="2">
              <div class="form-group">
                <label for="input-type">Tipo *</label>
                <b-form-select
                  id="input-type"
                  v-model="form.type"
                  v-validate="'required'"
                  class="form-control"
                  name="type"
                  :options="tiposOrganizacao"
                />
                <field-error :msg="veeErrors" field="type" />
              </div>
            </b-col>
            <div class="col-sm-3">
              <div class="form-group">
                <label for="input-cnpj">CNPJ</label>
                <b-form-input
                  id="input-cnpj"
                  v-model="form.cnpj"
                  v-mask="['##.###.###/####-##']"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <div class="form-group">
                <label for="input-address">Endereço</label>
                <b-form-input id="input-address" v-model="form.address" />
              </div>
            </div>
          </div>
          <div class="row">
            <b-col sm="4">
              <div class="form-group">
                <label for="input-uf">Estado</label>
                <b-form-select
                  id="input-uf"
                  v-model="form.uf"
                  v-validate="'required'"
                  class="form-control"
                  :options="estados.map((e) => e.uf)"
                  name="uf"
                  @input="loadCities()"
                />
                <field-error :msg="veeErrors" field="uf" />
              </div>
            </b-col>
            <b-col sm="4">
              <div class="form-group">
                <label for="input-county">Município</label>
                <b-form-select
                  id="input-county"
                  v-model="form.county"
                  class="form-control"
                  :options="cidades"
                  @input="loadPracas()"
                />
              </div>
            </b-col>
            <b-col sm="4">
              <div class="form-group">
                <label for="input-square">Região imediata</label>
                <input
                  id="input-square"
                  v-model="form.square"
                  type="text"
                  readonly
                  class="form-control"
                  text-field="nome"
                />
              </div>
            </b-col>
          </div>
          <div class="row">
            <b-col sm="6">
              <div class="form-group">
                <label for="input-territory">Território</label>
                <b-form-select
                  id="input-territory"
                  v-model="form.territory"
                  class="form-control"
                  :options="territorios"
                  value-field="nome"
                  text-field="nome"
                />
              </div>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-3">
              <div class="form-group">
                <label for="input-contact">Telefone</label>
                <b-form-input
                  id="input-contact"
                  v-model="form.contact"
                  v-mask="['(##) #####-####']"
                  name="contact"
                />
              </div>
            </div>
            <div class="col-sm-3">
              <div class="form-group">
                <label for="input-site">Site</label>
                <b-form-input id="input-site" v-model="form.site" name="Site" />
              </div>
            </div>
            <div class="col-sm-3">
              <div class="form-group">
                <label for="input-socialNetwork">Rede social</label>
                <b-form-input
                  id="input-socialNetwork"
                  v-model="form.socialNetwork"
                  name="socialNetwork"
                />
              </div>
            </div>
            <div class="col-sm-3">
              <div class="form-group">
                <label for="input-email">E-mail *</label>
                <b-form-input
                  id="input-email"
                  v-model="form.email"
                  v-validate="'required'"
                  name="email"
                />
                <field-error :msg="veeErrors" field="email" />
              </div>
            </div>
          </div>
          <div class="row">
            <b-col sm="6">
              <div class="form-group">
                <label for="input-chainLink">Posição comercial</label>
                <b-form-select
                  id="input-chainLink"
                  v-model="form.chainLink"
                  class="form-control"
                  name="chainLink"
                  :options="tiposOrganizacao"
                />
              </div>
            </b-col>
            <b-col sm="6">
              <div class="form-group">
                <label for="input-acting">Atuação na cadeia de valor</label>
                <b-form-select
                  id="input-acting"
                  v-model="form.acting"
                  class="form-control"
                  :options="tiposCadeiaValor"
                />
              </div>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <b-form-group label="Produtos">
                <b-form-checkbox-group
                  v-model="form.products"
                  :options="products"
                  value-field="id"
                  text-field="name"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <b-form-group label="Boas práticas">
                <b-form-checkbox-group
                  v-model="form.bestPractices"
                  :options="bestPractices"
                  value-field="id"
                  text-field="name"
                />
              </b-form-group>
            </div>
            <div class="col-sm-12">
              <b-form-group label="Certificação">
                <b-form-checkbox-group
                  v-model="form.certifications"
                  :options="certificationTypes"
                  value-field="id"
                  text-field="name"
                />
              </b-form-group>
            </div>
            <div class="col-sm-12">
              <div class="form-group">
                <label for="input-comments">Comentários</label>
                <b-form-textarea id="input-comments" v-model="form.comments" />
              </div>
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
import pracas from '@/data/praca.json'
import territorios from '@/data/territorio.json'
import tiposOrganizacao from '@/data/tipos-organizacao.json'
import tiposCadeiaValor from '@/data/tipos-cadeia-valor.json'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      pracas,
      territorios,
      tiposOrganizacao,
      tiposCadeiaValor,
      estados,
      cidades,
      form: {
        name: '',
        type: '',
        cnpj: '',
        address: '',
        territory: 'Selecione o território',
        contact: '',
        chainLink: '',
        square: '',
        squareid: '',
        protectedArea: '',
        members: 0,
        products: [],
        bestPractices: [],
        certifications: [],
        uf: '',
        county: '',
        comments: '',
        email: '',
        sigla: '',
        acting: '',
        site: '',
        socialNetwork: '',
      },
      products: [],
      bestPractices: [],
      certificationTypes: [],
    }
  },
  async created() {
    await this.list()
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }

    this.loadCities()
    this.loadPracas()
  },
  methods: {
    async list() {
      this.territorios.sort(function (a, b) {
        if (a.nome < b.nome) {
          return -1
        } else {
          return true
        }
      })
      this.products = await this.$axios.$get('products')
      const tipos = await this.$axios.$get('types')
      this.bestPractices = tipos.filter((i) => {
        return i.type === 'Boas práticas'
      })
      this.certificationTypes = tipos.filter((i) => {
        return i.type === 'Certificação'
      })
    },
    loadCities() {
      // lista de cidades com somente o item "selecione a município"
      this.cidades = [{ value: '', text: 'Selecione a município' }]

      // filtra as cidades conforme a UF selecionada
      if (this.form.uf) {
        this.cidades = this.cidades.concat(Object(cidades)[this.form.uf])
      }

      // limpa a município digitada, caso não exista na lista
      if (this.form.county && this.cidades) {
        if (!this.cidades.find((c) => c === this.form.county)) {
          this.form.county = ''
        }
      }
    },

    // filtra as regiões imediatas conforme a município selecionada
    loadPracas() {
      if (this.form.county) {
        const cidade = this.form.county
        const pracas = this.pracas.filter(function (item) {
          return item.cidade === cidade
        })
        if (pracas && pracas.length > 0) {
          this.form.square = pracas[0].nome
          this.form.squareid = pracas[0].id
        }
      }
    },
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('organizations/edit/' + id)
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
      this.$validator.validate().then((isValid) => {
        if (isValid) {
          this.is_sending = true

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
          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'organizations/' + this.$route.params.id
              : 'organizations',
            data: this.form,
          })
            .then((resp) => {
              const category = resp.data
              if (category && category._id) {
                this.notify('Organização salvo com sucesso')
                this.$router.replace('/cadastros/organizacoes')
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
