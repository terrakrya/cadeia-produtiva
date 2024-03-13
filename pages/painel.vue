<template>
  <div class="SpeciesProduct">
    <div class="panel">
      <div class="panel-body">
        <div>
          <h4 class="form-title">Dados publicados</h4>
          <h6 class="form-subtitle">
            Mostrando preços
            <span v-if="productFilter"
              >para<b> {{ productFilter }}</b></span
            >
            da região
            {{ this.$auth.user.chestnutRegion }}
          </h6>
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
              <b-row v-if="userRegionSummary" class="price-summary-box">
                <div class="date-box-wrapper">
                  <font-awesome-icon
                    icon="fa-solid fa-calendar-days"
                    size="lg"
                  />
                  <div
                    class="date-box d-flex flex-column justify-content-center align-items-center"
                  >
                    <span>Safra</span>
                    <span>{{ formattedPeriod }}</span>
                  </div>
                </div>
                <div class="prices-container">
                  <div class="price-row">
                    <div class="price-label">Mínimo</div>
                    <div class="price-value">
                      {{ userRegionSummary.minimumPrice | moeda }}
                      <span class="price-measure">{{
                        this.$auth.user.unitOfMeasurement
                      }}</span>
                    </div>
                  </div>
                  <hr />
                  <div class="price-row">
                    <div class="price-label">Médio</div>
                    <div class="price-value">
                      {{ userRegionSummary.averagePrice | moeda }}
                      <span class="price-measure">{{
                        this.$auth.user.unitOfMeasurement
                      }}</span>
                    </div>
                  </div>
                  <hr />
                  <div class="price-row">
                    <div class="price-label">Máximo</div>
                    <div class="price-value">
                      {{ userRegionSummary.maximumPrice | moeda }}
                      <span class="price-measure">{{
                        this.$auth.user.unitOfMeasurement
                      }}</span>
                    </div>
                  </div>
                </div>
              </b-row>

              <div class="text-right">
                <b-button
                  id="show-btn"
                  class="btn mb-1 mt-5"
                  variant="panel"
                  to="/operacional/informacao-preco/cadastrar"
                  >Informar Preço</b-button
                >
              </div>

              <hr />
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="form-title">Outras regiões</h4>
                  <h6 class="form-subtitle">
                    Mostrando preços médios de outras regiões
                  </h6>
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
                        formatter="{}"
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
                  <div
                    class="px-3 py-2 square-summary d-flex justify-content-between align-items-center"
                  >
                    <div>
                      {{ square.averagePrice | moeda }}
                      <span
                        v-if="
                          square.averagePrice > userRegionSummary.averagePrice
                        "
                        class="text-success"
                      >
                        ↑
                        {{
                          priceDiffFromUserRegion(
                            userRegionSummary.averagePrice,
                            square.averagePrice
                          ) | percentage
                        }}
                      </span>
                      <span
                        v-if="
                          square.averagePrice < userRegionSummary.averagePrice
                        "
                        class="text-danger"
                      >
                        ↓
                        {{
                          priceDiffFromUserRegion(
                            userRegionSummary.averagePrice,
                            square.averagePrice
                          ) | percentage
                        }}
                      </span>
                    </div>
                    <div class="ml-3">
                      <strong>{{ square.name }}</strong>
                    </div>
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
import buyerPositions from '@/data/posicao-do-comprador.json'
import NoItem from '~/components/NoItem.vue'
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
      regiao: null,
      loading: false,
      showFilters: false,
      filters: {
        unitOfMeasurement: '',
        product: '',
        buyerPosition: '',
        from: '',
        to: '',
        chestnutRegions: [],
      },
      buyerPositions,
      priceInformations: [],
      products: [],
      summary: null,
      userRegionSummary: null,
      gradientColors: [],
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
    currentHarvestPeriod() {
      const today = this.$moment(new Date())

      if (today.isBefore(`${today.year()}-10-01`)) {
        return [
          `${new Date().getFullYear() - 1}-10-01`,
          `${new Date().getFullYear()}-09-30`,
        ]
      }

      return [
        `${new Date().getFullYear()}-10-01`,
        `${new Date().getFullYear() + 1}-09-30`,
      ]
    },
    formattedPeriod() {
      return `${this.currentHarvestPeriod[0].slice(
        0,
        4
      )}/${this.currentHarvestPeriod[1].slice(0, 4)}`
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
        !this.$auth.user.country ||
        !this.$auth.user.chestnutRegion
      ) {
        this.$router.push(
          '/cadastros/usuarios/' + this.$auth.user._id + '/perfil'
        )
      } else {
        this.loading = true
        await this.loadProducts()
        this.filters = {
          ...this.filters,
          from: this.currentHarvestPeriod[0],
          to: this.currentHarvestPeriod[1],
        }
        await this.load()
        this.loading = false
      }
    }
  },
  methods: {
    priceDiffFromUserRegion(basePrice, priceToCompare) {
      return (priceToCompare - basePrice) / basePrice
    },

    async loadProducts() {
      const products = await this.$axios.$get('products')
      this.products = products
      if (this.products && this.products.length > 0) {
        this.filters.product = this.products[0]._id
      }
    },

    async load() {
      this.filters = {
        ...this.filters,
        unitOfMeasurement: this.$auth.user.unitOfMeasurement,
      }

      const summary = await this.$axios.$get('price-informations/summary', {
        params: this.filters,
      })

      const userRegionSummary = await this.$axios.$get(
        'price-informations/summary',
        {
          params: {
            product: this.filters.product,
            unitOfMeasurement: this.$auth.user.unitOfMeasurement,
            chestnutRegions: [this.$auth.user.chestnutRegion],
            from: this.currentHarvestPeriod[0],
            to: this.currentHarvestPeriod[1],
          },
        }
      )

      this.summary = summary
      this.userRegionSummary = userRegionSummary
    },

    applyFilters() {
      this.showFilters = false
      this.load()
    },
  },
}
</script>
