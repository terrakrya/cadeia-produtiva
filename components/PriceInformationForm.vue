<template>
  <div class="type">
    <Breadcrumb
      :links="[['Operacional', '/operacional/informacao-preco']]"
      active="Registro de coleta de preços"
    />
    <div class="panel">
      <div class="panel-body">
        <div class="col-sm-6">
          <h1>Registro de coleta de preços</h1>
        </div>
        <br />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div v-if="isAdmin || isGlobalManager" class="row">
            <div class="col-sm-8">
              <b-form-group label="Organização ">
                <form-entity-select
                  v-model="form.organization"
                  type="organizations"
                  @input="teste()"
                />
              </b-form-group>
            </div>
          </div>
          <div v-if="isAdmin || isGlobalManager || isManager" class="row">
            <div class="col-sm-8">
              <b-form-group label="Informante">
                <b-form-select
                  v-model="form.messenger"
                  class="form-control"
                  :options="messengers"
                  value-field="id"
                  text-field="name"
                  name="messenger"
                  @input="loadMessenger()"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label=" Tipo *">
                <b-form-select
                  v-model="form.transaction"
                  v-validate="'required'"
                  class="form-control"
                  aria-placeholder="selecione a opção"
                  :options="transacao"
                  nome="transaction"
                />
                <field-error :msg="veeErrors" field="transaction" />
              </b-form-group>
            </div>
            <div
              v-if="form.transaction === 'transação realizada'"
              class="col-sm-4"
            >
              <b-form-group label="Quantidade transacionada *">
                <money
                  v-model="form.transactedQuantity"
                  v-validate="'required'"
                  prefix=""
                  class="form-control"
                  nome="transactedQuantity"
                ></money>
                <field-error :msg="veeErrors" field="transactedQuantity" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label="Preço mínimo *">
                <money
                  v-model="form.originalMinimumPrice"
                  v-validate="'required'"
                  prefix=""
                  class="form-control"
                  name="originalMinimumPrice"
                ></money>
                <field-error :msg="veeErrors" field="originalMinimumPrice" />
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group label="Preço máximo *">
                <money
                  v-model="form.originalMaximumPrice"
                  prefix=""
                  class="form-control"
                ></money>
                <field-error :msg="veeErrors" field="originalMaximumPrice" />
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group label="Unidade de medida *">
                <b-form-select
                  v-model="form.measure"
                  v-validate="'required'"
                  class="form-control"
                  :options="medida"
                  @imput="Measure()"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <b-form-group label="Produto *">
                <b-form-select
                  v-model="form.product"
                  v-validate="'required'"
                  class="form-control"
                  :options="products"
                  value-field="id"
                  text-field="name"
                  name="product"
                />
                <field-error :msg="veeErrors" field="product" />
              </b-form-group>
            </div>
            <div class="col-sm-6">
              <b-form-group label="Posição na cadeia de valor do comprador *">
                <b-form-select
                  v-model="form.buyerPosition"
                  v-validate="'required'"
                  class="form-control"
                  :options="posicaoComprador"
                  nome="buyerPosition"
                />
                <field-error :msg="veeErrors" field="buyerPosition" />
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
              <b-form-group label="Estado *">
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
              <b-form-group label="Cidade *">
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
          <form-submit :sending="is_sending" @imput="transactedQuantity()" />
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
import transacao from '@/data/transacionada.json'
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
      transacao,
      form: {
        messenger: '',
        createdAt: this.$moment(new Date())
          .tz('America/Sao_Paulo')
          .format('YYYY-MM-DD'),
        buyerPosition: '',
        minimumPrice: '',
        maximumPrice: '',
        originalMinimumPrice: '',
        originalMaximumPrice: '',
        currency: '',
        country: '',
        measure: '',
        product: '',
        uf: '',
        city: '',
        transaction: '',
        transactedQuantity: '',
        organization: '',
      },
      products: [],
      messengers: [],
      organizations: '',
    }
  },
  async created() {
    await this.list()
    if (this.isEditing()) {
      this.edit(this.$route.params.id)
    }
    this.loadCities()
    this.loadMessenger()
    this.getMeasure()
    
  },
  methods: {
    async teste() {
      if (this.isAdmin || this.isGlobalManager) {
        this.organizations = await this.$axios.$get(
          'organizations/' + this.form.organization
        )
        this.products = this.organizations.products
        const users = await this.$axios.$get('users')
        const messengers = users.filter((i) => {
          return i.role === 'mensageiro'
        })
        this.messengers = messengers.filter((i) => {
          return i.organization._id === this.form.organization
        })
      }
    },
    async list() {
      if (this.isManager) {
        this.products = await this.$axios.$get('products')
        const users = await this.$axios.$get('users')
        this.messengers = users.filter((i) => {
          return i.role === 'mensageiro'
        })
      }

      if (!this.isAdmin || this.isGlobalManager) {
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
    transactedQuantity(min, max, mid) {
      if (this.form.transaction === 'preço de mercado') {
        this.form.minimumPrice = min * mid
        this.form.maximumPrice = max * mid
      } else if (this.form.transaction === 'transação realizada') {
        this.form.minimumPrice = min * mid * this.form.transactedQuantity
        this.form.maximumPrice = max * mid * this.form.transactedQuantity
      }
    },
    getMeasure() {
      if (this.form.measure === 'Kg') {
        return 1
      } else if (this.form.measure === 'Tonelada') {
        return 1000
      } else if (this.form.measure === 'Latão') {
        return 12
      } else if (this.form.measure === 'Caixa') {
        return 24
      } else if (
        this.form.measure === 'Hectolitro' ||
        this.form.measure === 'Saca'
      ) {
        return 60
      } else if (this.form.measure === 'Barrica') {
        return 72
      }
    },
    edit(id) {
      this.is_loading = true
      this.$axios
        .get('price-informations/' + id)
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
        if (
          !this.form.originalMinimumPrice ||
          this.form.originalMinimumPrice === 0
        ) {
          this.veeErrors.items.push({
            id: 101,
            vmId: this.veeErrors.vmId,
            field: 'originalMinimumPrice',
            msg: 'Este campo é obrigatório.',
            rule: 'required',
            scope: null,
          })
          isValid = false
        } else if (this.form.originalMaximumPrice === 0) {
          this.form.originalMaximumPrice = this.form.originalMinimumPrice
        } else if (
          this.form.originalMaximumPrice < this.form.originalMinimumPrice
        ) {
          this.veeErrors.items.push({
            id: 102,
            vmId: this.veeErrors.vmId,
            field: 'originalMaximumPrice',
            msg: 'o preço máximo tem que ser maior ou igual ao preço mínimo .',
            rule: 'required',
            scope: null,
          })
          isValid = false
        } else if (this.form.transaction === 'transação realizada') {
          if (this.form.transactedQuantity === 0.0) {
            this.veeErrors.items.push({
              id: 103,
              vmId: this.veeErrors.vmId,
              field: 'transactedQuantity',
              msg: 'Este campo é obrigatório.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
        } else if (this.form.transaction === 'preço de mercado') {
          this.form.transactedQuantity = 0
        } else {
          this.veeErrors.items = this.veeErrors.items.filter(
            (error) => error.id !== 101 && error.id !== 102 && error.id !== 103
          )
        }

        if (isValid) {
          this.is_sending = true
          if (this.form.transaction === 'preço de mercado') {
            this.form.transactedQuantity = 0
          }
          if (this.isManager && !this.form.messenger) {
            this.form.messenger = this.currentUser._id
          }
          if (this.isMessenger) {
            this.form.messenger = this.currentUser._id
          }
          this.transactedQuantity(
            this.form.originalMinimumPrice,
            this.form.originalMaximumPrice,
            this.getMeasure()
          )

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'price-informations/' + this.$route.params.id
              : 'price-informations',
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
