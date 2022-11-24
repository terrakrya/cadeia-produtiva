<template>
  <div class="specie">
    <Breadcrumb
      :links="[['Cadastro', '/cadastros/especies']]"
      active="espécie"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Espécie" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label="Código *">
                <b-form-input
                  v-model="form.code"
                  v-validate="'required'"
                  name="code"
                />
                <field-error :msg="veeErrors" field="code" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="Nome científico *">
                <b-form-input
                  v-model="form.scientificName"
                  v-validate="'required'"
                  name="scientificName"
                />
                <field-error :msg="veeErrors" field="scientificName" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Nome popular">
                <b-form-input v-model="form.popularName" name="popularName" />
              </b-form-group>
            </b-col>
            <div class="col-sm-6">
              <b-form-group label="Descrição">
                <b-form-input v-model="form.description" name="description" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <Upload
                v-model="form.images"
                multiple
                type="images"
                label="Fotos da semente"
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
export default {
  components: {
    Breadcrumb,
    Upload,
  },
  data() {
    return {
      form: {
        code: '',
        description: '',
        scientificName: '',
        popularName: '',
        images: [],
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
        .get('species/' + id)
        .then((response) => {
          response.data.popularName = response.data.popularName.join(',')

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
        // valida a code
        if (this.form.code) {
          const id = this.isEditing() ? this.$route.params.id : null
          // unicidade do code
          if (await this.isNotUniqueCode(id, this.form.code)) {
            this.veeErrors.items.push({
              id: 102,
              vmId: this.veeErrors.vmId,
              field: 'code',
              msg: 'Este código já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          } else if (
            await this.isNotUniqueScientificName(id, this.form.scientificName)
          ) {
            this.veeErrors.items.push({
              id: 103,
              vmId: this.veeErrors.vmId,
              field: 'code',
              msg: 'Este nome científico já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          } else {
            this.veeErrors.items = this.veeErrors.items.filter(
              (error) => error.id !== 102 && error.id !== 103
            )
          }
        }

        if (isValid) {
          this.is_sending = true

          const formData = Object.assign({}, this.form)
          formData.popularName = formData.popularName.split(',')

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'species/' + this.$route.params.id
              : 'species',
            data: formData,
          })
            .then((resp) => {
              const category = resp.data
              if (category && category._id) {
                this.notify('Espécie salvo com sucesso')
                this.$router.replace('/cadastros/especies')
              }
              this.is_sending = false
            })
            .catch(this.showError)
        }
      })
    },
    async isNotUniqueCode(id, code) {
      return !(await this.$axios.$post('species/unique-code', {
        id,
        code,
      }))
    },
    async isNotUniqueScientificName(id, scientificName) {
      return !(await this.$axios.$post('species/unique-code', {
        id,
        scientificName,
      }))
    },
  },
}
</script>
