<template>
  <div class="type">
    <Breadcrumb
      :links="[['Cadastro', '/operacional/informacao-preco']]"
      active="preço"
    />
    <div class="panel">
      <div class="panel-body">
        <form-headline name="Coleta de preços" />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-8">
              <b-form-group label="busca do cadastro de informantes *">
                <b-form-select
                  v-model="form.messenger"
                  class="form-control"
                  :options="messengers"
                  value-field="id"
                  text-field="name"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group :label="'Data *'">
                <b-form-datepicker
                  v-model="form.createdAt"
                  v-validate="'required'"
                  class="date"
                  name="date_time"
                  locale="pt-BR"
                  :date-format-options="{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }"
                  placeholder="DD/MM/AAAA"
                />
              </b-form-group>
            </div>
            <div class="col-sm-8">
              <b-form-group label="Posição na cadeia produtiva do comprador">
                <b-form-select
                  v-model="form.buyerPosition"
                  class="form-control"
                  :options="posicaoComprador"
                />
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
              <b-form-group label="Cidade">
                <b-form-select
                  v-model="form.city"
                  class="form-control"
                  :options="cidades"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label="Preço *">
                <money
                  v-model="form.price"
                  v-validate="'required'"
                  prefix=""
                  class="form-control"
                ></money>
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group label="Moeda">
                <b-form-select
                  v-model="form.coin"
                  class="form-control"
                  :options="moeda"
                />
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group label="País">
                <b-form-select
                  v-model="form.country"
                  class="form-control"
                  :options="pais"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label="Unidade de medida *">
                <b-form-select
                  v-model="form.measure"
                  v-validate="'required'"
                  class="form-control"
                  :options="medida"
                />
              </b-form-group>
            </div>
            <div class="col-sm-8">
              <b-form-group label="produto *">
                <b-form-select
                  v-model="form.product"
                  v-validate="'required'"
                  class="form-control"
                  :options="products"
                  value-field="id"
                  text-field="description"
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
import posicaoComprador from '@/data/posicao-do-comprador.json'
import moeda from '@/data/moeda.json'
import medida from '@/data/tipo-de-unidade.json'
import pais from '@/data/pais.json'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      medida,
      moeda,
      posicaoComprador,
      pais,
      estados,
      cidades,
      form: {
        messenger: '',
        createdAt: this.$moment(new Date())
          .tz('America/Sao_Paulo')
          .format('YYYY-MM-DD'),
        buyerPosition: '',
        price: '',
        coin: '',
        country: '',
        measure: '',
        product: '',
        uf: '',
        city: '',
      },
      products: [],
      messengers: [],
    }
  },
  async created() {
    await this.list()
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }

    this.loadCities()
  },
  methods: {
    async list() {
      this.products = await this.$axios.$get('products')
      const users = await this.$axios.$get('users')
      this.messengers = users.filter((i) => {
        return i.role === 'mensageiro'
      })
    },
    loadCities() {
      // lista de cidades com somente o item "selecione a cidade"
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]

      // filtra as cidades conforme a UF selecionada
      if (this.form.uf) {
        this.cidades = this.cidades.concat(Object(cidades)[this.form.uf])
      }

      // limpa a cidade digitada, caso não exista na lista
      if (this.form.city && this.cidades) {
        if (!this.cidades.find((c) => c === this.form.city)) {
          this.form.city = ''
        }
      }
    },
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('priceInformations/' + id)
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

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'priceInformations/' + this.$route.params.id
              : 'priceInformations',
            data: this.form,
          })
            .then((resp) => {
              const category = resp.data
              if (category && category._id) {
                this.notify('informações de preço salvo com sucesso')
                this.$router.replace('/operacional/informacao-preco')
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
