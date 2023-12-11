<template>
  <div class="SpeciesProduct">
    <breadcrumb active="Dados publicados" />
    <div class="panel">
      <div class="panel-body">
        <div class="panel-title">
          <div>
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

                <FormRegionsTranslator id="bv-modal-1" />
                <FormMeasureTranslator id="bv-modal" />
                <FormMetodologia id="bv-modal-2" />
              </div>
              <div class="text-right">
                <b-button
                  id="show-btn"
                  class="btn btn-primary mb-1"
                  variant="danger"
                  to="/operacional/informacao-preco/cadastrar"
                  >Coletar Preços</b-button
                >
                <b-button
                  id="show-btn"
                  class="btn btn-primary mb-1"
                  variant="danger"
                  to="/dados-publicados"
                  >Dados publicados</b-button
                >
              </div>
            </div>
          </div>
        </div>
        <div class="info-content">
          <iframe
            v-if="!isMessenger"
            title="Report Section"
            width="100%"
            min-height="500px"
            src="https://app.powerbi.com/view?r=eyJrIjoiZjkwMzE2YzQtYTMxNy00MjZlLWE1YmQtMDAxYzViMjhhMDAyIiwidCI6ImZmMjIxZjk2LTI1NGUtNDFlYy1iMTUwLWI5ZmExZDBkMDNjNCJ9"
            frameborder="0"
            allowFullScreen="true"
            style="min-height: 1500px; margin-bottom: 32px"
          ></iframe>
          <div v-else>
            <div v-if="loading" class="text-center">
              <Loading loading />
            </div>
            <div v-else>
              <b-row v-if="summary" class="text-center">
                <b-col>
                  <div class="text-muted"><small>Mínimo</small></div>
                  <div class="p-2 price-info">
                    {{ summary.minimumPrice | moeda }}
                    Por {{ $auth.user.unitOfMeasurement }}
                  </div>
                </b-col>
                <b-col>
                  <div class="text-muted"><small>Médio</small></div>
                  <div class="p-2 price-info">
                    {{ summary.averagePrice | moeda }}
                    Por {{ $auth.user.unitOfMeasurement }}
                  </div>
                </b-col>
                <b-col>
                  <div class="text-muted"><small>Máximo</small></div>
                  <div class="p-2 price-info">
                    {{ summary.maximumPrice | moeda }}
                    Por {{ $auth.user.unitOfMeasurement }}
                  </div>
                </b-col>
              </b-row>

              <hr />
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="text-left">Preço médio por região</h5>
                  <div
                    v-if="!showFilters"
                    class="text-muted pointer"
                    style="font-size: 11px"
                    @click="showFilters = true"
                  >
                    <div v-if="productFilter">
                      {{ productFilter }}
                      <b-icon icon="pencil" class="ml-1" />
                    </div>
                    <div v-if="filters.buyerPosition">
                      {{ filters.buyerPosition }}
                      <b-icon icon="pencil" class="ml-1" />
                    </div>
                    <div v-if="filters.from && filters.to">
                      De {{ filters.from | moment('DD/MM/YYYY') }} até
                      {{ filters.to | moment('DD/MM/YYYY') }}
                      <b-icon icon="pencil" class="ml-1" />
                    </div>
                    <div v-if="filters.from && !filters.to">
                      De {{ filters.from | moment('DD/MM/YYYY') }} até Hoje
                      <b-icon icon="pencil" class="ml-1" />
                    </div>
                    <div v-if="!filters.from && filters.to">
                      Até {{ filters.to | moment('DD/MM/YYYY') }}
                      <b-icon icon="pencil" class="ml-1" />
                    </div>
                  </div>
                </div>
                <div>
                  <b-btn @click="showFilters = !showFilters">
                    <b-icon icon="filter"></b-icon>
                  </b-btn>
                </div>
              </div>
              <div v-if="showFilters" class="py-4">
                <div class="row">
                  <div class="col-md-6">
                    <b-form-group label="Produto">
                      <b-form-select
                        v-model="filters.product"
                        class="form-control"
                        :options="products"
                        value-field="_id"
                        text-field="name"
                      />
                    </b-form-group>
                  </div>
                  <div class="col-md-6">
                    <b-form-group label="Tipo de comprador">
                      <b-form-select
                        v-model="filters.buyerPosition"
                        class="form-control"
                        :options="buyerPositions"
                      />
                    </b-form-group>
                  </div>
                </div>
                <div class="row">
                  <b-col cols="6">
                    <b-form-group label="Data inicial">
                      <b-form-input
                        v-model="filters.from"
                        type="date"
                        name="date_time"
                        locale="pt-BR"
                        placeholder="DD/MM/AAAA"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col cols="6">
                    <b-form-group label="Data final">
                      <b-form-input
                        v-model="filters.to"
                        type="date"
                        name="date_time"
                        locale="pt-BR"
                        placeholder="DD/MM/AAAA"
                        clearable
                      />
                    </b-form-group>
                  </b-col>
                </div>
                <b-button
                  variant="primary"
                  size="lg"
                  block
                  @click="applyFilters"
                >
                  Filtrar
                </b-button>
              </div>
              <div v-if="summary" class="pt-4">
                <div
                  v-for="(square, squareIndex) in summary.squares"
                  :key="square.name"
                  class="mb-3"
                >
                  <div class="ml-3">
                    <strong>{{ square.name }}</strong>
                  </div>
                  <div
                    class="px-3 py-1 square-summary"
                    :style="
                      'width: ' +
                      (square.percentAveragePrice > 40
                        ? square.percentAveragePrice
                        : 40) +
                      '%; background-color: ' +
                      generateGradientColors[squareIndex]
                    "
                  >
                    {{ square.averagePrice | moeda }}
                  </div>
                </div>
              </div>
              <div v-else class="text-center pt-4">
                <NoItem :list="[]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import FormRegionsTranslator from '@/components/FormRegionsTranslator'
import FormMeasureTranslator from '@/components/FormMeasureTranslator'
import FormMetodologia from '@/components/FormMetodologia.vue'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import squares from '@/data/praca.json'
import buyerPositions from '@/data/posicao-do-comprador.json'
import NoItem from '~/components/NoItem.vue'
import regiao from '@/data/regioes-castanheiras.json'
export default {
  components: {
    Breadcrumb,
    FormRegionsTranslator,
    FormMeasureTranslator,
    FormMetodologia,
    NoItem,
  },
  data() {
    return {
      regiao,
      loading: false,
      showFilters: false,
      filters: {
        product: '',
        buyerPosition: 'Cooperativa (não beneficia)',
        from: '',
        to: '',
      },
      buyerPositions,
      estados,
      cidades,
      squares,
      priceInformations: [],
      products: [],
      summary: null,
    }
  },
  computed: {
    productFilter() {
      if (this.filters.product) {
        const product = this.products.find(
          (product) => product._id === this.filters.product
        )
        return product.name
      }
      return ''
    },
    generateGradientColors() {
      const arr = this.summary.squares
      const startColor = [32, 153, 104] // RGB values for #209968
      const endColor = [153, 125, 32] // RGB values for #997D20
      const colorRange = [
        endColor[0] - startColor[0],
        endColor[1] - startColor[1],
        endColor[2] - startColor[2],
      ]
      const colorStep = 1 / (arr.length - 1)
      const gradientColors = []

      for (let i = 0; i < arr.length; i++) {
        const r = Math.round(startColor[0] + colorRange[0] * (i * colorStep))
        const g = Math.round(startColor[1] + colorRange[1] * (i * colorStep))
        const b = Math.round(startColor[2] + colorRange[2] * (i * colorStep))
        const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
        gradientColors.push(color)
      }

      return gradientColors
    },
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
      } else {
        this.loading = true
        await this.loadProducts()
        await this.load()
        this.loading = false
      }
    }
    const user = await this.$axios.$get('user/' + this.$auth.user._id)
    this.regiao = this.regiao.filter(function (item) {
      return item.municipio === user.city
    })
    console.log(user.city)
  },
  methods: {
    async loadProducts() {
      const products = await this.$axios.$get('products')
      this.products = products
      if (this.products && this.products.length > 0) {
        this.filters.product = this.products[0]._id
      }
    },

    async load() {
      const summary = await this.$axios.$get('price-informations/summary', {
        params: this.filters,
      })
      this.summary = summary
    },
    applyFilters() {
      this.showFilters = false
      this.load()
    },
  },
}
</script>
