<template>
  <div class="SpeciesProduct">
    <div class="panel">
      <div class="panel-body">
        <div>
          <h4 class="form-title">Painel</h4>
          <h6 class="form-subtitle">
            Preços de
            <span v-if="productFilter"
              ><b>{{ productFilter }}</b></span
            >
            da região {{ $auth.user.region }}
            <span v-if="filters.from && filters.to">
              de {{ filters.from | moment('DD/MM/YYYY') }} até
              {{ filters.to | moment('DD/MM/YYYY') }}
            </span>
            <span v-else-if="filters.from && !filters.to">
              de {{ filters.from | moment('DD/MM/YYYY') }} até Hoje
            </span>
            <span v-else-if="!filters.from && filters.to">
              até {{ filters.to | moment('DD/MM/YYYY') }}
            </span>
          </h6>
        </div>
        <div class="info-content">
          <div v-if="loading" class="text-center">
            <Loading loading />
          </div>
          <div v-else>
            <!-- Resumo da região do usuário -->
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
                    <span>
                      {{ filters.from | moment('YYYY') }}/{{
                        filters.to | moment('YYYY')
                      }}
                    </span>
                  </div>
                  <div
                    class="d-flex flex-column align-items-center"
                    v-else-if="filters.name == 'mes'"
                  >
                    <span>Mês</span>
                    <span>
                      {{ filters.from | moment('DD/MM') }} a
                      {{ filters.to | moment('DD/MM') }}
                    </span>
                  </div>
                  <div
                    class="d-flex flex-column align-items-center"
                    v-else-if="filters.name == 'quinzena'"
                  >
                    <span>Quinzena</span>
                    <span>
                      {{ filters.from | moment('DD/MM') }} a
                      {{ filters.to | moment('DD/MM') }}
                    </span>
                  </div>
                  <div
                    class="d-flex flex-column align-items-center"
                    v-else-if="filters.name == 'semana'"
                  >
                    <span>Semana</span>
                    <span>
                      {{ filters.from | moment('DD/MM') }} a
                      {{ filters.to | moment('DD/MM') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="prices-container w-100">
                <div class="price-row">
                  <div class="price-label">Mínimo</div>
                  <div class="price-value">
                    {{ userRegionSummary.minimumPrice | moeda }}
                    <span class="price-measure">{{
                      $auth.user.unitOfMeasurement
                    }}</span>
                  </div>
                </div>
                <hr />
                <div class="price-row">
                  <div class="price-label">Máximo</div>
                  <div class="price-value">
                    {{ userRegionSummary.maximumPrice | moeda }}
                    <span class="price-measure">{{
                      $auth.user.unitOfMeasurement
                    }}</span>
                  </div>
                </div>
                <hr />
                <div class="price-row">
                  <div class="price-label">Médio</div>
                  <div class="price-value">
                    {{ userRegionSummary.averagePrice | moeda }}
                    <span class="price-measure">{{
                      $auth.user.unitOfMeasurement
                    }}</span>
                  </div>
                </div>
                <hr />
                <div class="price-row">
                  <div class="price-label">Preço mais comum</div>
                  <div class="price-value">
                    {{ userRegionSummary.moda | moeda }}
                    <span class="price-measure">{{
                      $auth.user.unitOfMeasurement
                    }}</span>
                  </div>
                </div>
                <hr />
                <div class="measure-row mt-2 d-flex justify-content-between">
                  <span> Preços de 1 {{ $auth.user.unitOfMeasurement }} </span>
                  <span>
                    Preços Informados: {{ userRegionSummary.totalPrices }}
                  </span>
                </div>
              </div>
            </b-row>

            <!-- Botão de Filtro -->
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

            <!-- Botões adicionais -->
            <div class="text-right">
              <b-button
                id="show-btn"
                class="btn mb-1 mt-3"
                variant="panel"
                to="/operacional/informacao-preco/cadastrar"
              >
                Informar Preço
              </b-button>
            </div>
            <div class="text-right">
              <b-button
                id="show-btn"
                class="btn mb-1 mt-3"
                variant="panel"
                to="/operacional/dados-ecologicos/cadastrar"
              >
                Informar Dados Ecológicos
              </b-button>
            </div>

            <!-- Gráfico -->
            <hr />
            <div>
              <h4 class="form-title">
                Preço da Safra em {{ filters.unitOfMeasurement }}
              </h4>
              <line-chart :chart-data="chartData" />
            </div>

            <!-- Outras Regiões -->
            <hr />
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="form-title">Outras regiões</h4>
              </div>
            </div>
            <div v-if="summary && summary.length" class="pt-4">
              <div
                v-for="(square, squareIndex) in summary"
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
                      v-else-if="
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
import localforage from 'localforage'

export default {
  components: {
    Breadcrumb,
    FormRegionsTranslator,
    FormMeasureTranslator,
    FormMetodologia,
    NoItem,
    LineChart,
    FilterModal,
  },
  data() {
    return {
      loading: false,
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
      products: [],
      summary: [],
      userRegionSummary: null,
    }
  },
  computed: {
    productFilter() {
      if (this.filters.product) {
        const product = this.products.find(
          (product) => product._id === this.filters.product
        )
        return product ? product.name : ''
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
      !this.$auth.user.region ||
      !this.$auth.user.productId
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
    }
  },
  methods: {
    squareIsUserRegion(name) {
      return name === this.$auth.user.region
    },
    priceDiffFromUserRegion(basePrice, priceToCompare) {
      return (priceToCompare - basePrice) / basePrice
    },
    async loadProducts() {
      try {
        if (navigator.onLine) {
          const products = await this.$axios.$get('products')
          this.products = products
          
          if (this.$auth.user.productId) {
            const userProduct = this.products.find(product => product._id === this.$auth.user.productId)
            if (userProduct) {
              this.filters.product = this.$auth.user.productId
            } else {
              this.$router.push('/cadastros/usuarios/' + this.$auth.user._id + '/perfil')
              return
            }
          }
        } else {
          const cachedProducts = await this.$getCachedData('reference', 'products')
          if (cachedProducts) {
            this.products = cachedProducts
            
            if (this.$auth.user.productId) {
              const userProduct = this.products.find(product => product._id === this.$auth.user.productId)
              if (userProduct) {
                this.filters.product = this.$auth.user.productId
              } else {
                this.$router.push('/cadastros/usuarios/' + this.$auth.user._id + '/perfil')
                return
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      }
    },
    async load() {
      this.filters = {
        ...this.filters,
        unitOfMeasurement: this.$auth.user.unitOfMeasurement,
      }
      
      try {
        if (navigator.onLine) {
          // Online: fetch data from server
          const squares = await this.$axios.$get('price-informations/summary', {
            params: this.filters,
          })
          
          // Store the data for offline use
          await localforage.setItem('cachedSummary', squares)
          this.summary = squares
          
        } else {
          // Offline: use cached data
          const cachedSummary = await localforage.getItem('cachedSummary')
          this.summary = cachedSummary || []
        }
        
        // Extract the userRegionSummary from squares
        this.userRegionSummary = this.summary.find(
          (square) => square.name === this.$auth.user.region
        )
        
        // Deal with case when user region isn't found
        if (!this.userRegionSummary) {
          this.userRegionSummary = {
            minimumPrice: null,
            maximumPrice: null,
            averagePrice: null,
            moda: null,
            totalPrices: 0,
          }
        }
        
        // Load chart data with offline support
        await this.loadChartData()
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
      
      this.loading = false
    },
    async loadChartData() {
      try {
        if (navigator.onLine) {
          const data = await this.$axios.$get('price-informations/harvest-mode', {
            params: {
              from: this.filters.from,
              to: this.filters.to,
              unitOfMeasurement: this.$auth.user.unitOfMeasurement,
              product: this.filters.product,
              regions: [this.$auth.user.region],
            },
          })
          
          // Cache the chart data
          await localforage.setItem('cachedChartData', data)
          this.updateChartData(data)
        } else {
          // Use cached chart data when offline
          const cachedData = await localforage.getItem('cachedChartData')
          if (cachedData) {
            this.updateChartData(cachedData)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar os dados da safra:', error)
      }
    },
    updateChartData(data) {
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
      this.filters.from = from
      this.filters.to = to
      this.load()
    },
    currentHarvestPeriod() {
      const today = this.$moment(new Date())

      if (today.isBefore(`${today.year()}-10-01`)) {
        return [`${today.year() - 1}-10-01`, `${today.year()}-09-30`]
      }

      return [`${today.year()}-10-01`, `${today.year() + 1}-09-30`]
    },
  },
}
</script>
