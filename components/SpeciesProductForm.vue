<template>
  <div class="SpeciesProduct">
    <Breadcrumb
      :links="[['Cadastro', '/cadastros/especies-produtos']]"
      active="Espécie/produto"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Classificação da Espécie/Produto" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
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
              <b-form-group label="Espécie *">
                <b-form-select
                  v-model="form.specie"
                  class="form-control"
                  :options="speciesOptions"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Grupo">
                <b-form-select
                  v-model="form.group"
                  class="form-control"
                  :options="grupo"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group label="Industrializada">
                <b-form-select
                  v-model="form.industrialized"
                  class="form-control"
                  placeholder="Selecione o subgrupo"
                  :options="industrialized"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Tamanho (classe)">
                <b-form-select
                  v-model="form.class"
                  class="form-control"
                  placeholder="Selecione a classe"
                  :options="classe"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group label="Tipo">
                <b-form-select
                  v-model="form.type"
                  class="form-control"
                  placeholder="Selecione o Tipo"
                  :options="tipo"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label="Descrição ">
                <b-form-input v-model="form.description" />
              </b-form-group>
            </div>
            <div class="col-md-6">
              <Upload
                v-model="form.image"
                type="images"
                label="Foto da castanha"
              />
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
import Upload from '@/components/Upload'
import tipo from '@/data/tipos-especie_produto.json'
import grupo from '@/data/grupo.json'
import industrialized from '@/data/subgrupo.json'
import classe from '@/data/classe.json'
export default {
  components: {
    Breadcrumb,
    Upload,
  },
  data() {
    return {
      tipo,
      grupo,
      industrialized,
      classe,
      speciesOptions: [],
      form: {
        name: '',
        description: '',
        type: '',
        industrialized: '',
        class: '',
        group: '',
        specie: '',
        image: [],
      },
    }
  },
  async created() {
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
    await this.list()
  },
  methods: {
    async list() {
      try {
        const speciesData = await this.$axios.$get('species')
        this.speciesOptions = [
          { value: '', text: 'Selecione uma espécie'},
        ].concat(
          speciesData.map((specie) => ({
            value: specie._id,
            text: specie.popularName,
          }))
        )
      } catch (error) {
        console.error('Erro ao carregar espécies:', error)
      }
    },
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('species-products/' + id)
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
        const id = this.isEditing() ? this.$route.params.id : null
        // unicidade do name
        if (await this.isNotUniqueName(id, this.form.name)) {
          this.veeErrors.items.push({
            id: 102,
            vmId: this.veeErrors.vmId,
            field: 'name',
            msg: 'Este nome já existe.',
            rule: 'required',
            scope: null,
          })
          isValid = false
        } else {
          this.veeErrors.items = this.veeErrors.items.filter(
            (error) => error.id !== 102
          )
        }

        if (isValid) {
          this.is_sending = true

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'species-products/' + this.$route.params.id
              : 'species-products',
            data: this.form,
          })
            .then((resp) => {
              const category = resp.data
              if (category && category._id) {
                this.notify('Tipo salvo com sucesso')
                this.$router.replace('/cadastros/especies-produtos')
              }
              this.is_sending = false
            })
            .catch(this.showError)
        }
      })
    },
    async isNotUniqueName(id, name) {
      return !(await this.$axios.$post('species-products/unique-name', {
        id,
        name,
      }))
    },
  },
}
</script>
