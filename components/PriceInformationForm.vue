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
          <div v-if="isAdmin || isManager" class="row">
            <div class="col-sm-8">
              <b-form-group label="busca do cadastro de informantes *">
                <b-form-select
                  v-model="form.messenger"
                  v-validate="'required'"
                  class="form-control"
                  :options="messengers"
                  value-field="id"
                  text-field="name"
                  name="messenger"
                  @input="loadMessenger()"
                />
                <field-error :msg="veeErrors" field="messenger" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label="Preço Mínimo*">
                <money
                  v-model="form.MinimumPrice"
                  v-validate="'required'"
                  prefix=""
                  class="form-control"
                  name="MinimumPrice"
                ></money>
                <field-error :msg="veeErrors" field="MinimumPrice" />
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group label="Preço Máximo*">
                <money
                  v-model="form.MaximumPrice"
                  prefix=""
                  class="form-control"
                ></money>
                <field-error :msg="veeErrors" field="MaximumPrice" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label="produto *">
                <b-form-select
                  v-model="form.product"
                  v-validate="'required'"
                  class="form-control"
                  :options="products"
                  value-field="id"
                  text-field="description"
                  name="product"
                />
                <field-error :msg="veeErrors" field="product" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
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
                  name="city"
                />
                <field-error :msg="veeErrors" field="city" />
              </b-form-group>
            </b-col>
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
            <div class="col-sm-4">
              <b-form-group label="Moeda">
                <b-form-select
                  v-model="form.currency"
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
        MinimumPrice: '',
        MaximumPrice: '',
        currency: '',
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
    this.loadMessenger()
  },
  methods: {
    async list() {
      this.products = await this.$axios.$get('products')
      const users = await this.$axios.$get('users')
      this.messengers = users.filter((i) => {
        return i.role === 'mensageiro'
      })
      if (!this.isAdmin) {
        this.form.currency = this.currentUser.currency
        this.form.country = this.currentUser.country
        this.form.measure = this.currentUser.unitOfMeasurement
        this.form.uf = this.currentUser.uf
        this.form.city = this.currentUser.city
      }
    },
    async loadMessenger() {
      if (this.form.messenger) {
        const selectedMessenger = await this.$axios.$get(
          'users/' + this.form.messenger
        )
        this.form.currency = selectedMessenger.currency
        this.form.country = selectedMessenger.country
        this.form.measure = selectedMessenger.unitOfMeasurement
        this.form.uf = selectedMessenger.uf
        this.form.city = selectedMessenger.city
      }
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
        // validação do preço
        if (!this.form.MinimumPrice || this.form.MinimumPrice === 0) {
          this.veeErrors.items.push({
            id: 103,
            vmId: this.veeErrors.vmId,
            field: 'MinimumPrice',
            msg: 'Este campo é obrigatório.',
            rule: 'required',
            scope: null,
          })
          isValid = false
        } else if (this.form.MaximumPrice === 0) {
          this.form.MaximumPrice = this.form.MinimumPrice
        } else if (this.form.MaximumPrice < this.form.MinimumPrice) {
          this.veeErrors.items.push({
            id: 102,
            vmId: this.veeErrors.vmId,
            field: 'MaximumPrice',
            msg: 'o preço máximo tem que ser maior ou igual ao preço mínimo .',
            rule: 'required',
            scope: null,
          })
          isValid = false
        } else {
          this.veeErrors.items = this.veeErrors.items.filter(
            (error) => error.id !== 102 && error.id !== 103
          )
        }

        if (isValid) {
          this.is_sending = true

          if (this.isMessenger) {
            this.form.messenger = this.currentUser._id
          }

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
