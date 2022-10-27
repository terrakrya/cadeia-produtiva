<template>
  <div class="product">
    <Breadcrumb :links="[['Cadastro', '/produtos']]" active="Produto" />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Produto" />
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
              <b-form-group label="Descrição *">
                <b-form-input
                  v-model="form.description"
                  v-validate="'required'"
                  name="description"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label="Selecionar uma classe de espécie/produto *">
                <form-entity-select
                  v-model="form.specieProduct"
                  v-validate="'required'"
                  type="speciesProducts"
                  name="specieProduct"
                />
                <field-error :msg="veeErrors" field="specieProduct" />
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
import FormEntitySelect from '@/components/FormEntitySelect'
export default {
  components: {
    Breadcrumb,
    FormEntitySelect,
  },
  data() {
    return {
      form: {
        code: '',
        description: '',
        specieProduct: '',
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
        .get('products/' + id)
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
          } else {
            this.veeErrors.items = this.veeErrors.items.filter(
              (error) => error.id !== 102
            )
          }
        }

        if (isValid) {
          this.is_sending = true

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'products/' + this.$route.params.id
              : 'products',
            data: this.form,
          })
            .then((resp) => {
              const product = resp.data
              if (product && product._id) {
                this.notify('Produto salvo com sucesso')
                this.$router.replace('/produtos')
              }
              this.is_sending = false
            })
            .catch(this.showError)
        }
      })
    },
    async isNotUniqueCode(id, code) {
      return !(await this.$axios.$post('products/unique-code', {
        id,
        code,
      }))
    },
  },
}
</script>
