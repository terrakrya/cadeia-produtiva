<template>
  <div class="type">
    <Breadcrumb :links="[['Cadastro', '/cadastros/tipos']]" active="Tipo" />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Tipos de boas práticas e certificação" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label=" Tipo *">
                <b-form-radio-group
                  v-model="form.type"
                  v-validate="'required'"
                  :options="tiposPermitidos"
                  name="type"
                />
                <field-error :msg="veeErrors" field="type" />
              </b-form-group>
            </div>
          </div>
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
            <div class="col-sm-3">
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
              <b-form-group label="Descrição *">
                <b-form-input
                  v-model="form.description"
                  v-validate="'required'"
                  name="description"
                />
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
import tipos from '@/data/tipos.json'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      form: {
        name: '',
        code: '',
        description: '',
        type: null,
      },
    }
  },
  created() {
    this.tiposPermitidos = tipos
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
  },
  methods: {
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('types/' + id)
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
          } 
          if (await this.isNotUniqueName(id, this.form.name)) {
            this.veeErrors.items.push({
              id: 103,
              vmId: this.veeErrors.vmId,
              field: 'name',
              msg: 'Este Nome já existe.',
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

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing() ? 'types/' + this.$route.params.id : 'types',
            data: this.form,
          })
            .then((resp) => {
              const category = resp.data
              if (category && category._id) {
                this.notify('Tipo salvo com sucesso')
                this.$router.replace('/cadastros/tipos')
              }
              this.is_sending = false
            })
            .catch(this.showError)
        }
      })
    },
    async isNotUniqueCode(id, code) {
      return !(await this.$axios.$post('types/unique-code', {
        id,
        code,
      }))
    },
    async isNotUniqueName(id, name) {
      return !(await this.$axios.$post('types/unique-name', {
        id,
        name,
      }))
    },
  },
}
</script>
