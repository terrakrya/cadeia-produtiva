<template>
  <div class="product">
    <Breadcrumb
      :links="[['Cadastro', '/cadastros/produtos']]"
      active="Produto"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Produto" />
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
            <b-col sm="6">
              <b-form-group label=" Boas práticas ">
                <b-form-select
                  v-model="form.bestPractices"
                  value-field="id"
                  text-field="name"
                  class="form-control"
                  :options="bestPractices"
                />
              </b-form-group>
            </b-col>
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
            <b-col sm="6">
              <b-form-group label=" Certificação ">
                <b-form-select
                  v-model="form.certifications"
                  value-field="id"
                  text-field="name"
                  class="form-control"
                  :options="certifications"
                />
              </b-form-group>
            </b-col>
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
        name: '',
        code: '',
        description: '',
        specieProduct: '',
        bestPractices: '',
        certifications: '',
      },
      bestPractices: [],
      certifications: [],
    }
  },
  async created() {
    await this.list()
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
  },
  methods: {
    async edit(id) {
      this.is_loading = true

      try {
        const dados = await this.$axios.$get('products/' + id)

        this.form.name = dados.name
        this.form.code = dados.code
        this.form.description = dados.description
        this.form.specieProduct = dados.specieProduct
        this.form.bestPractices = dados.bestPractices
        this.form.certifications = dados.certifications
        console.log(dados.bestPractices)
      } catch (e) {
        this.showError(e)
      }

      this.is_loading = false
    },
    async list() {
      const tipos = await this.$axios.$get('types')
      this.bestPractices = tipos.filter((i) => {
        return i.type === 'Boas práticas'
      })
      this.certifications = tipos.filter((i) => {
        return i.type === 'Certificação'
      })
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
              msg: 'Este código já existe.',
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
            url: this.isEditing()
              ? 'products/' + this.$route.params.id
              : 'products',
            data: this.form,
          })
            .then((resp) => {
              const product = resp.data
              if (product && product._id) {
                this.notify('Produto salvo com sucesso')
                this.$router.replace('/cadastros/produtos')
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
    async isNotUniqueName(id, name) {
      return !(await this.$axios.$post('products/unique-name', {
        id,
        name,
      }))
    },
  },
}
</script>
