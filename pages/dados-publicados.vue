<template>
  <div class="SpeciesProduct">
    <breadcrumb active="Dados publicados" />
    <div class="panel">
      <div class="panel-body">
        <div class="d-flex justify-content-between">
          <div>
            <b-button
              id="show-btn"
              variant="secondary"
              size="sm"
              class="mb-1"
              @click="$bvModal.show('bv-modal')"
              >Medidas</b-button
            >
            <b-button
              id="show-btn"
              variant="secondary"
              size="sm"
              class="mb-1"
              @click="$bvModal.show('bv-modal-1')"
              >Regiões</b-button
            >
            <b-button
              id="show-btn"
              size="sm"
              class="mb-1"
              variant="secondary"
              @click="$bvModal.show('bv-modal-2')"
              >Metodologia</b-button
            >

            <FormSquareTranslator id="bv-modal-1" />
            <FormMeasureTranslator id="bv-modal" />
            <FormMetodologia id="bv-modal-2" />
          </div>
          <div class="text-right">
            <b-button
              id="show-btn"
              class="btn btn-primary"
              variant="danger"
              to="/operacional/informacao-preco"
              >Coleta de preços</b-button
            >
          </div>
        </div>
        <div class="info-content">
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label="Produto">
                <b-form-select
                  v-model="filters.product"
                  class="form-control"
                  :options="products"
                  value-field="_id"
                  text-field="name"
                  @input="applyFilters"
                />
              </b-form-group>
            </div>
            <b-col sm="4">
              <b-form-group label="Estado">
                <b-form-select
                  v-model="filters.uf"
                  class="form-control"
                  :options="[
                    { value: '', text: 'Todos os estados' },
                    ...estados.map((e) => e.uf),
                  ]"
                  name="uf"
                  @input="loadCities(true)"
                />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Município">
                <b-form-select
                  v-model="filters.city"
                  class="form-control"
                  :options="cidades"
                  @input="loadPracas(true)"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <b-col sm="4">
              <b-form-group label="Data inicial">
                <b-form-datepicker
                  v-model="filters.from"
                  class="date"
                  name="date_time"
                  locale="pt-BR"
                  :date-format-options="{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }"
                  placeholder="DD/MM/AAAA"
                  @input="applyFilters"
                />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Data final">
                <b-form-datepicker
                  v-model="filters.to"
                  class="date"
                  name="date_time"
                  locale="pt-BR"
                  :date-format-options="{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }"
                  placeholder="DD/MM/AAAA"
                  @input="applyFilters"
                />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Região imediata">
                <input
                  v-model="filters.square"
                  type="text"
                  readonly
                  class="form-control"
                  text-field="nome"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="De ">
                <b-form-select
                  v-model="filters.from"
                  class="form-control"
                  :options="buyerPositions"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group label="Para">
                <b-form-select
                  v-model="filters.to"
                  class="form-control"
                  :options="buyerPositions"
                />
              </b-form-group>
            </b-col>
          </div>
          <br />
          <no-item :list="priceInformations" />
          <form-grid-informat :list="priceInformations" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import FormGridInformat from '@/components/FormGridInformat'
import FormSquareTranslator from '@/components/FormSquareTranslator'
import FormMeasureTranslator from '@/components/FormMeasureTranslator'
import FormMetodologia from '@/components/FormMetodologia.vue'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import pracas from '@/data/praca.json'
import buyerPositions from '@/data/posicao-do-comprador.json'
export default {
  components: {
    Breadcrumb,
    FormGridInformat,
    FormSquareTranslator,
    FormMeasureTranslator,
    FormMetodologia,
  },
  data() {
    return {
      filters: {
        uf: '',
        city: '',
        square: null,
        from: '',
        to: '',
        product: '',
      },
      buyerPositions,
      estados,
      cidades,
      pracas,
      priceInformations: [],
      products: [],
    }
  },

  async created() {
    if (this.$auth.user.role === 'mensageiro') {
      if (
        !this.$auth.user.unitOfMeasurement ||
        !this.$auth.user.buyerPosition ||
        !this.$auth.user.uf ||
        !this.$auth.user.city ||
        !this.$auth.user.currency ||
        !this.$auth.user.country
      ) {
        this.$router.push(
          '/cadastros/usuarios/' + this.$auth.user._id + '/perfil'
        )
      }
    }
    await this.loadCities(false)
    await this.loadPracas(false)
    await this.applyFilters()
    await this.loadProducts()
  },
  methods: {
    async loadCities(loadFilters) {
      // lista de cidades com somente o item "selecione a cidade"
      this.cidades = [{ value: '', text: 'Todas as cidades' }]

      // filtra as cidades conforme a UF selecionada
      if (this.filters.uf) {
        this.cidades = this.cidades.concat(Object(cidades)[this.filters.uf])
      } else {
        this.filters.square = null
      }

      // limpa a cidade digitada, caso não exista na lista
      if (this.filters.city && this.cidades) {
        if (!this.cidades.find((c) => c === this.filters.city)) {
          this.filters.city = ''
        }
      }

      if (loadFilters) {
        await this.applyFilters()
      }
    },

    // filtra as regiões imediatas conforme a cidade selecionada
    async loadPracas(loadFilters) {
      if (this.filters.city) {
        const cidade = this.filters.city
        const pracas = this.pracas.filter(function (item) {
          return item.cidade === cidade
        })
        if (pracas && pracas.length > 0) {
          this.filters.square = pracas[0].nome
        }
        if (this.filters.city === 'Selecione a cidade') {
          this.filters.square = ''
        }
      } else {
        this.filters.square = null
      }

      if (loadFilters) {
        await this.applyFilters()
      }
    },

    async loadProducts() {
      const products = [{ _id: '', name: 'Selecione o produto' }]
      Array.prototype.push.apply(products, await this.$axios.$get('products'))
      this.products = products
    },

    async applyFilters() {
      const filters = {}

      if (this.filters.uf) {
        filters.uf = this.filters.uf
      }

      if (this.filters.city) {
        filters.city = this.filters.city
      }

      if (this.filters.product) {
        filters.product = this.filters.product
      }

      if (this.filters.from) {
        filters.from = this.filters.from
      }

      if (this.filters.to) {
        filters.to = this.filters.to
      }
      this.priceInformations = await this.$axios.$get(
        'price-informations/data-published',
        {
          params: {
            filters,
          },
        }
      )
      this.priceInformations.sort(function (a, b) {
        if (a.date > b.date) {
          return -1
        } else {
          return true
        }
      })
    },
  },
}
</script>
