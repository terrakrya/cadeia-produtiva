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
              <b-form-group label="Nome popular *">
                <b-form-input
                  v-model="form.popularName"
                  v-validate="'required'"
                  name="popularName"
                />
                <field-error :msg="veeErrors" field="popularName" />
              </b-form-group>
            </b-col>
          </div>
          <form-submit :sending="is_sending" />
        </b-form>
        
        <!-- Show measurements form only after species is saved -->
        <div v-if="specieId" class="mt-4">
          <hr>
          <measurement-form
            :specie-id="specieId"
          />
        </div>
        
        <div v-else-if="!isEditing()" class="alert alert-info mt-4">
          <p class="mb-0">
            <b-icon-info-circle /> 
            Salve a espécie primeiro para poder adicionar unidades de medida.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Breadcrumb from '@/components/Breadcrumb'
import MeasurementForm from '@/components/MeasurementForm'

export default {
  components: {
    Breadcrumb,
    MeasurementForm,
  },
  data() {
    return {
      form: {
        scientificName: '',
        popularName: '',
      },
      specieId: null,
    }
  },
  created() {
    if (this.isEditing()) {
      this.specieId = this.$route.params.id
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
          this.is_loading = false
        })
        .catch(this.showError)
    },
    save() {
      this.$validator.validate().then(async (isValid) => {
        if (isValid) {
          this.is_sending = true
          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'species/' + this.$route.params.id
              : 'species',
            data: this.form,
          })
            .then((resp) => {
              const specie = resp.data
              if (specie && specie._id) {
                this.notify('Espécie salvo com sucesso')
                this.specieId = specie._id
                
                if (!this.isEditing()) {
                  this.$router.replace(`/cadastros/especies/${specie._id}/editar`)
                }
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
