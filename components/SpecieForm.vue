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
              <b-form-group label="Nome científico *">
                <b-form-input
                  v-model="form.scientificName"
                  v-validate="'required'"
                  name="scientificName"
                />
                <field-error :msg="veeErrors" field="scientificName" />
              </b-form-group>
            </div>
            <b-col sm="6">
              <b-form-group label="Nome popular">
                <b-form-input
                  v-model="form.popularName"
                  v-validate="'required'"
                  name="popularName"
                />
                <field-error :msg="veeErrors" field="popularName" />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label="Descrição">
                <b-form-input v-model="form.description" name="description" />
              </b-form-group>
            </div>
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
        if (isValid) {
          this.is_sending = true

          // const formData = Object.assign({}, this.form)
          // formData.popularName = formData.popularName.split(',')

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'species/' + this.$route.params.id
              : 'species',
            data: this.form,
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
  },
}
</script>
