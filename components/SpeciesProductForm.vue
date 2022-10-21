<template>
  <div class="SpeciesProduct">
    <Breadcrumb
      :links="[['Cadastro', '/especies-produtos']]"
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
                <form-entity-select
                  v-model="form.specie"
                  v-validate="'required'"
                  type="species"
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
                  placeholder="Selecione o grupo"
                  :options="grupo"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group label="Subgrupo">
                <b-form-select
                  v-model="form.subgroup"
                  class="form-control"
                  placeholder="Selecione o subgrupo"
                  :options="subgrupo"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Classe">
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
import subgrupo from '@/data/subgrupo.json'
import classe from '@/data/classe.json'
import FormEntitySelect from '@/components/FormEntitySelect'
export default {
  components: {
    Breadcrumb,
    FormEntitySelect,
    Upload,
  },
  data() {
    return {
      tipo,
      grupo,
      subgrupo,
      classe,
      form: {
        name: '',
        description: '',
        type: '',
        subgroup: '',
        class: '',
        group: '',
        specie: '',
        image: [],
      },
    }
  },
  created() {
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
  },
  methods: {
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
                this.$router.replace('/especies-produtos')
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
