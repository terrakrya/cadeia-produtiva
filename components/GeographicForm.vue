<template>
  <div class="product">
    <Breadcrumb
      :links="[['Cadastro', '/cadastros/areas-geograficas']]"
      active="Áreas geográficas"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Áreas geográficas" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
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
                <b-form-select
                  v-model="form.selctPraca"
                  class="form-control"
                  :options="pracas"
                  value-field="id"
                  text-field="nome"
                  @input="loadPracas()"
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
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import pracas from '@/data/praca.json'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      estados,
      cidades,
      pracas,
      form: {
        uf: '',
        county: '',
        square: '',
        squareid: '',
        selctPraca: '',
      },
    }
  },
  created() {
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
    this.loadCities()
    this.loadPracas()
  },
  methods: {
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
      if (this.form.selctPraca) {
        const selctPraca = this.form.selctPraca
        const pracas = this.pracas.filter(function (item) {
          return item.id === selctPraca
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
        .get('geographic-areas/' + id)
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
        if (isValid) {
          this.is_sending = true

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'geographic-areas/' + this.$route.params.id
              : 'geographic-areas',
            data: this.form,
          })
            .then((resp) => {
              const product = resp.data
              if (product && product._id) {
                this.notify('Áreas geográficas salvo com sucesso')
                this.$router.replace('/cadastros/areas-geograficas')
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
