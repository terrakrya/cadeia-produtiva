<template>
  <div class="organization-form">
    <Breadcrumb
      :links="[['Cadastro', '/cadastros/organizações']]"
      active="Organização"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Organização" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-5">
              <b-form-group label="Nome *">
                <b-form-input
                  v-model="form.name"
                  v-validate="'required'"
                  name="name"
                />
                <field-error :msg="veeErrors" field="name" />
              </b-form-group>
            </div>
            <div class="col-sm-2">
              <b-form-group label="Sigla *">
                <b-form-input
                  v-model="form.sigla"
                  v-validate="'required'"
                  name="sigla"
                />
                <field-error :msg="veeErrors" field="sigla" />
              </b-form-group>
            </div>
            <b-col sm="2">
              <b-form-group label="Tipo *">
                <b-form-select
                  v-model="form.type"
                  v-validate="'required'"
                  class="form-control"
                  name="type"
                  :options="tiposOrganizacao"
                />
                <field-error :msg="veeErrors" field="type" />
              </b-form-group>
            </b-col>
            <div class="col-sm-3">
              <b-form-group label="CNPJ ">
                <b-form-input v-model="form.cnpj" v-mask="['##.###.###/####-##']" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <b-form-group label="Endereço ">
                <b-form-input v-model="form.address" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
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
              <b-form-group label="Município">
                <b-form-select
                  v-model="form.county"
                  class="form-control"
                  :options="cidades"
                  @input="loadPracas()"
                />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Praça">
                <input
                  v-model="form.square"
                  type="text"
                  readonly
                  class="form-control"
                  text-field="nome"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Território">
                <b-form-select
                  v-model="form.territory"
                  class="form-control"
                  placeholder='Selecione o território'
                  :options="territorios"
                  value-field="nome"
                  text-field="nome"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-3">
              <b-form-group label="Telefone ">
                <b-form-input
                  v-model="form.contact"
                  v-mask="['(##) #####-####']"
                  name="contact"
                />
              </b-form-group>
            </div>
            <div class="col-sm-3">
              <b-form-group label="Outros contatos ">
                <b-form-input
                  v-model="form.otherContacts"
                  name="otherContacts"
                />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="E-mail *">
                <b-form-input 
                 v-model="form.email" 
                 name="email"
                 v-validate="'required'"
                />
                <field-error :msg="veeErrors" field="email" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Posição comercial">
                <b-form-select
                  v-model="form.chainLink"
                  class="form-control"
                  name="chainLink"
                  :options="tiposOrganizacao"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group label=" Atuação na cadeia de valor ">
                <b-form-select
                  v-model="form.acting"
                  class="form-control"
                  :options="tiposCadeiaValor"
                />
              </b-form-group>
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
              <b-form-group label="Comentários">
                <b-form-textarea v-model="form.comments" />
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
import pracas from '@/data/praca.json'
import territorios from '@/data/territorio.json'
import tiposOrganizacao from '@/data/posicao-do-comprador.json'
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
        territory: '',
        contact: '',
        otherContacts: '',
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
      this.territorios.sort(function(a, b){
        if(a.nome < b.nome) {
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

    // filtra as praça conforme a município selecionada
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
