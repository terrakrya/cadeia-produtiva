<template>
  <div class="SpeciesProduct">
    <breadcrumb active="Dados publicados" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Dados Publicados</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <!-- <div>
              <b-button
                id="show-btn"
                class="btn btn-primary"
                variant="danger"
                to="/operacional/informacao-preco"
                >Histórico de Preços Informados</b-button
              >
              <b-button
                id="show-btn"
                class="btn btn-primary"
                variant="danger"
                @click="$bvModal.show('bv-modal')"
                >Medidas</b-button
              >

              <b-button
                id="show-btn"
                class="btn btn-primary"
                variant="danger"
                @click="$bvModal.show('bv-modal-1')"
                >Regiões Castanheiras</b-button
              >
              <b-button
                id="show-btn"
                class="btn btn-primary"
                variant="danger"
                @click="$bvModal.show('bv-modal-2')"
                >Nota metodológica</b-button
              >

              <FormRegionsTranslator id="bv-modal-1" />
              <FormMeasureTranslator id="bv-modal" />
              <FormMetodologia id="bv-modal-2" />
            </div> -->
          </div>
        </div>
        <div class="info-content">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="form-title mb-0">Filtros</h5>
            <b-button
              variant="danger"
              class="btn btn-primary"
              @click="downloadExcel"
            >
              <b-icon icon="download" class="mr-1"></b-icon>
              Download Excel
            </b-button>
          </div>
          <b-card class="mb-3 bg-gray-1">
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
                <b-form-group label="Data inicial">
                  <b-form-datepicker
                    v-model="filters.dateFrom"
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
                    v-model="filters.dateTo"
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
            </div>

            <!-- Botão para filtros avançados -->
            <div class="row">
              <div class="col-12">
                <b-button
                  variant="danger"
                  class="btn btn-primary mb-2"
                  @click="showAdvancedFilters = !showAdvancedFilters"
                >
                  <b-icon
                    :icon="showAdvancedFilters ? 'chevron-up' : 'chevron-down'"
                  ></b-icon>
                  {{ showAdvancedFilters ? 'Ocultar' : 'Mostrar' }} Filtros
                  Avançados
                </b-button>
              </div>
            </div>

            <!-- Filtros avançados (expansível) -->
            <b-collapse v-model="showAdvancedFilters">
              <hr />
              <div class="row">
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
                      @input="onCityChange"
                    />
                  </b-form-group>
                </b-col>
                <b-col sm="4">
                  <b-form-group label="Região Castanheira">
                    <b-form-select
                      v-model="filters.region"
                      :options="regionOptions"
                      :disabled="isRegionDisabled"
                      @input="onRegionChange"
                      class="form-control"
                    />
                    <small v-if="regionAutoSelected" class="text-muted">
                      Selecionada automaticamente baseada no estado e município
                    </small>
                  </b-form-group>
                </b-col>
              </div>
              <div class="row">
                <b-col sm="6">
                  <b-form-group label="De ">
                    <b-form-select
                      v-model="filters.buyerFrom"
                      class="form-control"
                      :options="buyerPositions"
                      @input="applyFilters"
                    />
                  </b-form-group>
                </b-col>
                <b-col sm="6">
                  <b-form-group label="Para">
                    <b-form-select
                      v-model="filters.buyerTo"
                      class="form-control"
                      :options="buyerPositions"
                      @input="applyFilters"
                    />
                  </b-form-group>
                </b-col>
              </div>
            </b-collapse>
          </b-card>
          
          <!-- Loading spinner -->
          <Loading :loading="loading" msg="Carregando dados" />
          
          <!-- Show content only when not loading -->
          <div v-if="!loading">
            <!-- Pagination controls and info -->
            <div v-if="priceInformations.length > 0" class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <small class="text-muted">
                  Exibindo {{ startRecord }} - {{ endRecord }} de {{ totalRecords }} registro(s)
                </small>
              </div>
              <div class="d-flex align-items-center">
                <small class="text-muted mr-2">Itens por página:</small>
                <b-form-select
                  v-model="perPage"
                  :options="perPageOptions"
                  size="sm"
                  style="width: auto;"
                  @change="currentPage = 1"
                />
              </div>
            </div>

            <no-item :list="priceInformations" />
            <form-grid-informat ref="gridInformat" :list="paginatedData" />
            
            <!-- Pagination -->
            <div v-if="priceInformations.length > 0 && totalPages > 1" class="d-flex justify-content-center mt-3">
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRecords"
                :per-page="perPage"
                :aria-controls="'price-informations-table'"
                size="sm"
                class="custom-pagination mb-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import FormGridInformat from '@/components/FormGridInformat'
import FormRegionsTranslator from '@/components/FormRegionsTranslator'
import FormMeasureTranslator from '@/components/FormMeasureTranslator'
import FormMetodologia from '@/components/FormMetodologia.vue'
import Loading from '@/components/Loading'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import regions from '@/data/regioes-castanheiras.json'
import buyerPositions from '@/data/posicao-do-comprador.json'
import * as XLSX from 'xlsx'

export default {
  components: {
    Breadcrumb,
    FormGridInformat,
    FormRegionsTranslator,
    FormMeasureTranslator,
    FormMetodologia,
    Loading,
  },
  data() {
    return {
      loading: false,
      currentPage: 1,
      perPage: 25,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 25, text: '25' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
      filters: {
        uf: '',
        city: '',
        region: '',
        square: null,
        dateFrom: '',
        dateTo: '',
        buyerFrom: '',
        buyerTo: '',
        product: '',
      },
      buyerPositions,
      estados,
      cidades,
      regionOptions: [],
      priceInformations: [],
      products: [],
      userMeasurement: null,
      showAdvancedFilters: false,
      regionAutoSelected: false,
    }
  },

  computed: {
    isRegionDisabled() {
      return this.regionAutoSelected && this.filters.uf && this.filters.city
    },
    
    totalRecords() {
      return this.priceInformations.length
    },
    
    totalPages() {
      return Math.ceil(this.totalRecords / this.perPage)
    },
    
    startRecord() {
      if (this.totalRecords === 0) return 0
      return (this.currentPage - 1) * this.perPage + 1
    },
    
    endRecord() {
      const end = this.currentPage * this.perPage
      return end > this.totalRecords ? this.totalRecords : end
    },
    
    paginatedData() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.priceInformations.slice(start, end)
    }
  },

  async created() {
    if (
      this.$auth.user.role === 'mensageiro' ||
      this.$auth.user.role === 'gestor'
    ) {
      this.$router.push('/painel')
    }

    this.loading = true
    try {
      await Promise.all([
        this.loadCities(false),
        this.loadUserMeasurement(),
        this.loadProducts(),
      ])

      await this.applyFilters()

      this.regionOptions = [
        { value: '', text: 'Todas as regiões' },
        ...[...new Set(regions.map((r) => r.regiaoCastanheira))].map((reg) => ({
          value: reg,
          text: reg,
        })),
      ]
    } finally {
      this.loading = false
    }
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
        // Limpa região automática quando UF é removido
        if (this.regionAutoSelected) {
          this.filters.region = ''
          this.regionAutoSelected = false
        }
      }

      // limpa a cidade digitada, caso não exista na lista
      if (this.filters.city && this.cidades) {
        if (!this.cidades.find((c) => c === this.filters.city)) {
          this.filters.city = ''
        }
      }

      // Atualiza região automaticamente se ambos UF e cidade estão selecionados
      this.updateRegionFromCity()

      if (loadFilters) {
        await this.applyFilters()
      }
    },

    updateRegionFromCity() {
      if (this.filters.uf && this.filters.city) {
        const regionData = regions.find(
          (r) => r.uf === this.filters.uf && r.municipio === this.filters.city
        )
        if (regionData) {
          this.filters.region = regionData.regiaoCastanheira
          this.regionAutoSelected = true
        }
      } else if (this.regionAutoSelected) {
        // Limpa região automática se UF ou cidade foram removidos
        this.filters.region = ''
        this.regionAutoSelected = false
      }
    },

    onCityChange() {
      this.updateRegionFromCity()
      this.applyFilters()
    },

    onRegionChange() {
      // Se o usuário alterar a região manualmente, desabilita seleção automática
      if (!this.regionAutoSelected) {
        this.applyFilters()
      }
    },

    async loadUserMeasurement() {
      try {
        if (this.$auth.user.measurementId) {
          const measurement = await this.$axios.$get(
            `measurements/${this.$auth.user.measurementId}`
          )
          this.userMeasurement = measurement
        }
      } catch (error) {
        console.error('Erro ao carregar medida do usuário:', error)
        this.userMeasurement = null
      }
    },

    async loadProducts() {
      const products = [{ _id: '', name: 'Selecione o produto' }]
      Array.prototype.push.apply(products, await this.$axios.$get('products'))
      this.products = products
    },

    async applyFilters() {
      this.loading = true
      try {
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

        if (this.filters.dateFrom) {
          filters.dateFrom = this.filters.dateFrom
        }

        if (this.filters.dateTo) {
          filters.dateTo = this.filters.dateTo
        }

        if (this.filters.buyerFrom && this.filters.buyerFrom !== '') {
          filters.buyerFrom = this.filters.buyerFrom
        }

        if (this.filters.buyerTo && this.filters.buyerTo !== '') {
          filters.buyerTo = this.filters.buyerTo
        }

        if (this.filters.region) {
          filters.regions = this.filters.region
        }

        this.priceInformations = await this.$axios.$get(
          'price-informations/data-published',
          {
            params: {
              filters,
            },
          }
        )
        
        // Reset para a primeira página quando aplicar filtros
        this.currentPage = 1
      } finally {
        this.loading = false
      }
    },

    downloadExcel() {
      // Retrieve the sorting parameters from the FormGridInformat component
      const grid = this.$refs.gridInformat
      const sortKey = grid ? grid.sortBy : 'date'
      const sortDesc = grid ? grid.sortDesc : true

      // Clone and sort the data according to the current sorting settings
      // IMPORTANTE: Usa todos os dados (priceInformations) para exportação, não apenas os paginados
      let sortedData = [...this.priceInformations].sort((a, b) => {
        let aVal, bVal
        if (sortKey === 'date') {
          // Convert date strings "dd/mm/yyyy" into Date objects for proper sorting
          aVal = new Date(a.date.split('/').reverse().join('-'))
          bVal = new Date(b.date.split('/').reverse().join('-'))
        } else if (sortKey === 'averagePrice') {
          // Use converted price for averagePrice column
          aVal = this.convertPrice(a.averagePrice)
          bVal = this.convertPrice(b.averagePrice)
        } else if (
          typeof a[sortKey] === 'string' &&
          typeof b[sortKey] === 'string'
        ) {
          // Compare strings case-insensitively
          aVal = a[sortKey].toLowerCase()
          bVal = b[sortKey].toLowerCase()
        } else {
          aVal = a[sortKey]
          bVal = b[sortKey]
        }

        if (aVal < bVal) return sortDesc ? 1 : -1
        if (aVal > bVal) return sortDesc ? -1 : 1
        return 0
      })

      const unit = this.$auth.user.unitOfMeasurement
      const exportData = sortedData.map((item) => ({
        De: item.buyerFrom,
        Para: item.buyerTo,
        Mensageiro: item.messenger,
        Município: item.city,
        'Região Castanheira': item.region || 'Não informado',
        Data: item.date,
        [`Preço médio (${unit})`]:
          Math.round(this.convertPrice(item.averagePrice) * 100) / 100,
        [`Preço Mínimo (${unit})`]:
          Math.round(this.convertPrice(item.minimumPrice) * 100) / 100,
        [`Preço Máximo (${unit})`]:
          Math.round(this.convertPrice(item.maximumPrice) * 100) / 100,
      }))

      // Create worksheet from JSON data
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Define column widths so that the text is fully readable
      worksheet['!cols'] = [
        { wch: 15 }, // "De"
        { wch: 15 }, // "Para"
        { wch: 20 }, // "Mensageiro"
        { wch: 20 }, // "Município"
        { wch: 25 }, // "Região Castanheira"
        { wch: 15 }, // "Data"
        { wch: 20 }, // "Preço médio"
        { wch: 20 }, // "Preço mínimo"
        { wch: 20 }, // "Preço máximo"
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Publicados')
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const downloadDate = new Date().toISOString().slice(0, 10)
      link.download = `Dados Publicados ${downloadDate}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    },

    convertPrice(price) {
      if (this.userMeasurement && this.userMeasurement.referenceInKg) {
        return price * this.userMeasurement.referenceInKg
      }

      return price || 0
    },
  },
}
</script>

<style scoped>
/* Estilos customizados para paginação seguindo o padrão visual do sistema */
.custom-pagination >>> .page-link {
  color: #852E27 !important; /* $brown1 */
  background-color: #ffffff !important; /* $white */
  border: 1px solid #ccc !important; /* $gray4 */
  border-radius: 50px !important; /* Seguindo o padrão do sistema */
  padding: 8px 12px !important;
  margin: 0 2px !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  transition: all 0.2s ease !important;
}

.custom-pagination >>> .page-link:hover {
  color: #ffffff !important;
  background-color: #93312A !important; /* $orange */
  border-color: #93312A !important;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.custom-pagination >>> .page-link:focus {
  color: #ffffff !important;
  background-color: #93312A !important; /* $orange */
  border-color: #93312A !important;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15) !important;
}

.custom-pagination >>> .page-item.active .page-link {
  color: #ffffff !important;
  background-color: #852E27 !important; /* $brown1 */
  border-color: #852E27 !important;
  font-weight: 700 !important;
  box-shadow: 0px 2px 6px rgba(133, 46, 39, 0.2) !important;
}

.custom-pagination >>> .page-item.disabled .page-link {
  color: #818181 !important; /* $gray7 */
  background-color: #f2f2f2 !important; /* $gray6 */
  border-color: #ccc !important;
  opacity: 0.6 !important;
}

.custom-pagination >>> .page-item:first-child .page-link,
.custom-pagination >>> .page-item:last-child .page-link {
  border-radius: 50px !important;
}

/* Estilos para o select de itens por página */
.form-control[size="sm"] {
  border-radius: 20px !important;
  border-color: #852E27 !important; /* $brown1 */
  font-weight: 500 !important;
  color: #852E27 !important; /* $brown1 */
}

.form-control[size="sm"]:focus {
  border-color: #93312A !important; /* $orange */
  box-shadow: 0 0 0 0.2rem rgba(147, 49, 42, 0.25) !important;
}
</style>
