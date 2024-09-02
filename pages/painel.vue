<template>
  <div class="SpeciesProduct">
    <div class="panel">
      <div class="panel-body">
        <div>
          <h4 class="form-title">Painel</h4>
          <h6 class="form-subtitle">
            Preços de
            <span v-if="productFilter"
              ><b> {{ productFilter }}</b></span
            >
            da região
            {{ this.$auth.user.region }}

            <span v-if="filters.from && filters.to">
              <span>de {{ filters.from | moment('DD/MM/YYYY') }}</span>
              <span>até</span>
              <span>{{ filters.to | moment('DD/MM/YYYY') }}</span>
            </span>
            <span v-if="filters.from && !filters.to">
              <span>de {{ filters.from | moment('DD/MM/YYYY') }}</span>
              <span>até</span>
              <span>Hoje</span>
            </span>
            <span v-if="!filters.from && filters.to">
              <span>até</span>
              <span>{{ filters.to | moment('DD/MM/YYYY') }}</span>
            </span>
          </h6>
        </div>
        <div class="info-content">
          <div v-if="loading" class="text-center">
            <Loading loading />
          </div>
          <div v-else>
            <b-row
              v-if="userRegionSummary"
              class="price-summary-box d-flex flex-column flex-md-row"
            >
              <div class="date-box-wrapper w-100 mb-3">
                <font-awesome-icon icon="fa-solid fa-calendar-days" size="lg" />
                <div
                  class="date-box d-flex flex-column justify-content-center align-items-center"
                >
                  <div
                    class="d-flex flex-column align-items-center"
                    v-if="filters.name == 'safra'"
                  >
                    <span>Safra</span>
                    <span
                      >{{ filters.from | moment('YYYY') }}/{{
                        filters.to | moment('YYYY')
                      }}</span
                    >
                  </div>
                  <div
                    class="d-flex flex-column align-items-center"
                    v-if="filters.name == 'mes'"
                  >
                    <span>Mês</span>
                    <span
                      >{{ filters.from | moment('DD/MM ') }}a{{
                        filters.to | moment(' DD/MM')
                      }}</span
                    >
                  </div>
                  <div
                    class="d-flex flex-column align-items-center"
                    v-if="filters.name == 'quinzena'"
                  >
                    <span>Quinzena</span>
                    <span
                      >{{ filters.from | moment('DD/MM ') }}a{{
                        filters.to | moment(' DD/MM')
                      }}</span
                    >
                  </div>
                  <div
                    class="d-flex flex-column align-items-center"
                    v-if="filters.name == 'semana'"
                  >
                    <span>Semana</span>
                    <span
                      >{{ filters.from | moment('DD/MM ') }}a{{
                        filters.to | moment(' DD/MM')
                      }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="prices-container w-100">
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
                  <div class="price-label">Máximo</div>
                  <div class="price-value">
                    {{ userRegionSummary.maximumPrice | moeda }}
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
                  <div class="price-label">Preço mais comum</div>
                  <div class="price-value">
                    {{ userRegionSummary.moda | moeda }}
                    <span class="price-measure">{{
                      this.$auth.user.unitOfMeasurement
                    }}</span>
                  </div>
                </div>
                <hr />
                <div class="measure-row mt-2 d-flex justify-content-between">
                  <span>
                    Preços de 1 {{ this.$auth.user.unitOfMeasurement }}
                  </span>
                  <span>
                    Preços Informados: {{ this.userRegionSummary.totalPrices }}
                  </span>
                </div>
              </div>
            </b-row>

            <b-button
              @click="isModalActive = true"
              id="show-btn"
              class="btn mb-1 mt-4"
              variant="panel"
            >
              Filtrar Dados
            </b-button>

            <FilterModal
              :isActive.sync="isModalActive"
              @apply-filter="applyFilter"
            />

            <div class="text-right">
              <b-button
                id="show-btn"
                class="btn mb-1 mt-3"
                variant="panel"
                to="/operacional/informacao-preco/cadastrar"
                >Informar Preço</b-button
              >
            </div>
            <div class="text-right">
              <b-button
                id="show-btn"
                class="btn mb-1 mt-3"
                variant="panel"
                to="/cadastros/ecological-data/cadastrar"
                >Informar Dados Ecológicos</b-button
              >
            </div>
            <hr />
            <div>
              <h4 class="form-title">
                Preço da Safra em {{ filters.unitOfMeasurement }}
              </h4>
              <line-chart :chart-data="chartData" />
            </div>
            <hr />
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="form-title">Outras regiões</h4>
                <div
                  v-if="!showFilters"
                  class="text-muted pointer"
                  style="font-size: 14px"
                  @click="showFilters = true"
                >
                  <div v-if="productFilter">
                    {{ productFilter }}
                  </div>
                  <div v-if="filters.buyerPosition">
                    {{ filters.buyerPosition }}
                  </div>
                  <div
                    v-if="filters.from && filters.to"
                    class="d-flex flex-column"
                  >
                    De {{ filters.from | moment('DD/MM/YYYY') }} até
                    {{ filters.to | moment('DD/MM/YYYY') }}
                  </div>
                  <div v-if="filters.from && !filters.to">
                    De {{ filters.from | moment('DD/MM/YYYY') }} até Hoje
                  </div>
                  <div v-if="!filters.from && filters.to">
                    Até {{ filters.to | moment('DD/MM/YYYY') }}
                  </div>
                </div>
              </div>
              <!-- <div>
                <b-btn @click="showFilters = !showFilters">
                  <b-icon icon="filter" font-scale="3"></b-icon>
                </b-btn>
              </div> -->
            </div>
            <!-- <div v-if="showFilters" class="py-4">
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
              <b-button variant="primary" size="lg" block @click="applyFilters">
                Filtrar
              </b-button>
            </div> -->
            <div v-if="summary" class="pt-4">
              <div
                v-for="(square, squareIndex) in summary.squares"
                :key="square.name"
                class="mb-3"
              >
                <div
                  class="px-3 py-2 square-summary d-flex flex-column"
                  :style="
                    'background-color: ' +
                    (squareIsUserRegion(square.name) ? '#e5e7eb' : 'white') +
                    ';'
                  "
                >
                  <div class="mb-3">
                    <strong>{{ square.name }}</strong>
                  </div>
                  <div style="font-size: 16px">
                    {{ square.averagePrice | moeda }}
                    <span
                      v-if="
                        userRegionSummary.averagePrice &&
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
                        userRegionSummary.averagePrice &&
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
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import FormRegionsTranslator from '@/components/FormRegionsTranslator'
import FormMeasureTranslator from '@/components/FormMeasureTranslator'
import FormMetodologia from '@/components/FormMetodologia.vue'
import buyerPositions from '@/data/posicao-do-comprador.json'
import NoItem from '~/components/NoItem.vue'
import LineChart from '@/components/LineChart.vue'
import FilterModal from '@/components/FilterModal.vue'
export default {
  components: {
    Breadcrumb,
    FormRegionsTranslator,
    FormMeasureTranslator,
    FormMetodologia,
    NoItem,
    LineChart,
  },
  data() {
    return {
      regiao: null,
      loading: false,
      showFilters: false,
      isModalActive: false,
      chartData: {
        labels: [],
        datasets: [],
      },
      filters: {
        unitOfMeasurement: '',
        name: 'safra',
        product: '',
        buyerPosition: '',
        from: '',
        to: '',
        regions: [],
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
  },

  async created() {
    if (
      !this.$auth.user.unitOfMeasurement ||
      !this.$auth.user.buyerPosition ||
      !this.$auth.user.uf ||
      !this.$auth.user.city ||
      !this.$auth.user.currency ||
      !this.$auth.user.country ||
      !this.$auth.user.region
    ) {
      this.$router.push(
        '/cadastros/usuarios/' + this.$auth.user._id + '/perfil'
      )
    } else {
      this.loading = true
      await this.loadProducts()
      const harvestPeriod = await this.currentHarvestPeriod()
      this.filters = {
        ...this.filters,
        from: harvestPeriod[0],
        to: harvestPeriod[1],
      }
      await this.load()
      this.loading = false
    }
  },
  methods: {
    squareIsUserRegion(name) {
      return name == this.$auth.user.region
    },
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
      const harvestPeriod = this.currentHarvestPeriod()

      const summary = await this.$axios.$get('price-informations/summary', {
        params: this.filters,
      })

      const userRegionSummary = await this.$axios.$get(
        'price-informations/summary',
        {
          params: {
            product: this.filters.product,
            unitOfMeasurement: this.$auth.user.unitOfMeasurement,
            regions: [this.$auth.user.region],
            from: this.filters.from,
            to: this.filters.to,
          },
        }
      )

      try {
        const response = await this.$axios.$get(
          'price-informations/harvest-mode',
          {
            params: {
              from: harvestPeriod[0],
              to: harvestPeriod[1],
              unitOfMeasurement: this.$auth.user.unitOfMeasurement,
              product: this.filters.product,
              regions: [this.$auth.user.region],
            },
          }
        )
        const data = response
        if (Array.isArray(data)) {
          this.chartData = {
            labels: data.map((item) => item.week),
            datasets: [
              {
                label: 'Preço Mais Comum por Semana',
                backgroundColor: '#6DC5D1',
                borderColor: '#6DC5D1',
                fill: false,
                data: data.map((item) => item.moda),
              },
            ],
          }
        } else {
          console.error('Dados retornados não são um array:', data)
        }
      } catch (error) {
        console.error('Erro ao buscar os dados da safra:', error)
      }

      this.summary = summary
      this.userRegionSummary = userRegionSummary
    },

    applyFilters() {
      this.showFilters = false
      this.load()
    },

    applyFilter(period) {
      let fromDate, toDate
      this.filters.name = period
      const currentDate = new Date()

      switch (period) {
        case 'safra':
          ;[fromDate, toDate] = this.currentHarvestPeriod()
          break
        case 'semana':
          fromDate = new Date(currentDate.setDate(currentDate.getDate() - 7))
          toDate = new Date()
          break
        case 'quinzena':
          fromDate = new Date(currentDate.setDate(currentDate.getDate() - 15))
          toDate = new Date()
          break
        case 'mes':
          fromDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1))
          toDate = new Date()
          break
        default:
          fromDate = null
          toDate = null
      }

      this.applyDateFilter(fromDate, toDate)
    },

    applyDateFilter(from, to) {
      // Implementação do filtro de data
      this.filters.from = from
      this.filters.to = to
      this.load()
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
  },
}
</script>
