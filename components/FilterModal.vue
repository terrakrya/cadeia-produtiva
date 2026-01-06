<template>
  <b-modal
    v-model="internalIsActive"
    title="Filtros"
    hide-footer
    centered
    size="lg"
    body-class="teste"
    header-close-label="Fechar"
    close-title="Fechar"
    @hidden="closeModal"
  >
    <div>
      <div class="filter-section mb-4">
        <h2 class="filter-title mb-3 h6">
          <font-awesome-icon icon="fa-solid fa-box-open" class="mr-2" />
          Produto e Unidade
        </h2>
        <b-row>
          <b-col md="6" class="mb-3 mb-md-0">
            <label class="small text-muted mb-1 d-block">Produto</label>
            <b-form-select
              v-model="selectedProduct"
              :options="productOptions"
              class="w-100 system-select"
            ></b-form-select>
          </b-col>
          <b-col md="6">
            <label class="small text-muted mb-1 d-block">Unidade de Medida</label>
            <b-form-select
              v-model="selectedUnit"
              :options="measurementOptions"
              :disabled="!measurements.length || loadingMeasurements"
              class="w-100 system-select"
            >
              <template #first>
                <b-form-select-option :value="''" disabled>
                  {{ loadingMeasurements ? 'Carregando...' : 'Selecione uma unidade' }}
                </b-form-select-option>
              </template>
            </b-form-select>
          </b-col>
        </b-row>
      </div>

      <div class="filter-section">
        <h2 class="filter-title mb-3 h6">
          <font-awesome-icon icon="fa-solid fa-calendar-days" class="mr-2" />
          Período de Análise
        </h2>
        <b-row class="filter-buttons-grid">
          <b-col cols="6" class="mb-3">
            <b-button
              class="filter-btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
              :class="selectedPeriod === 'safra' ? 'btn-selected' : 'btn-unselected'"
              @click="selectedPeriod = 'safra'"
            >
              <span class="font-weight-bold">Safra</span>
              <small class="d-none d-sm-block mt-1">Anual</small>
            </b-button>
          </b-col>
          <b-col cols="6" class="mb-3">
            <b-button
              class="filter-btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
              :class="selectedPeriod === 'mes' ? 'btn-selected' : 'btn-unselected'"
              @click="selectedPeriod = 'mes'"
            >
              <span class="font-weight-bold">Mês</span>
              <small class="d-none d-sm-block mt-1">Mensal</small>
            </b-button>
          </b-col>
          <b-col cols="6" class="mb-3">
            <b-button
              class="filter-btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
              :class="selectedPeriod === 'quinzena' ? 'btn-selected' : 'btn-unselected'"
              @click="selectedPeriod = 'quinzena'"
            >
              <span class="font-weight-bold">Quinzena</span>
              <small class="d-none d-sm-block mt-1">15 dias</small>
            </b-button>
          </b-col>
          <b-col cols="6" class="mb-3">
            <b-button
              class="filter-btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
              :class="selectedPeriod === 'semana' ? 'btn-selected' : 'btn-unselected'"
              @click="selectedPeriod = 'semana'"
            >
              <span class="font-weight-bold">Semana</span>
              <small class="d-none d-sm-block mt-1">7 dias</small>
            </b-button>
          </b-col>
        </b-row>
      </div>
    </div>
    <hr />
    <div class="d-flex justify-content-between align-items-center">
      <b-button 
        variant="outline-secondary" 
        class="px-4 rounded-pill" 
        @click="closeModal"
      >
        Cancelar
      </b-button>
      <b-button 
        class="px-4 btn-apply"
        @click="applyFilter"
        :disabled="!isValid"
      >
        Aplicar Filtros
      </b-button>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    products: {
      type: Array,
      default: () => [],
    },
    initialProduct: {
      type: String,
      default: '',
    },
    initialUnit: {
      type: String,
      default: '',
    },
    initialPeriod: {
      type: String,
      default: 'safra',
    },
  },
  data() {
    return {
      internalIsActive: this.isActive,
      selectedProduct: this.initialProduct,
      selectedUnit: this.initialUnit,
      selectedPeriod: this.initialPeriod,
      measurements: [],
      loadingMeasurements: false,
    }
  },
  computed: {
    productOptions() {
      return this.products.map((product) => ({
        value: product._id,
        text: product.name,
      }))
    },
    measurementOptions() {
      return this.measurements.map((measurement) => ({
        value: measurement.originalName,
        text: measurement.name,
      }))
    },
    isValid() {
      return this.selectedProduct && this.selectedUnit && this.selectedPeriod
    },
  },
  watch: {
    isActive(newVal) {
      this.internalIsActive = newVal
      if (newVal) {
        this.selectedProduct = this.initialProduct
        this.selectedUnit = this.initialUnit
        this.selectedPeriod = this.initialPeriod
        // Load measurements immediately if product is present
        if (this.selectedProduct) {
           this.loadMeasurements(this.selectedProduct)
        }
      }
    },
    selectedProduct(newVal) {
      if (newVal) {
        this.loadMeasurements(newVal)
      } else {
        this.measurements = []
        this.selectedUnit = ''
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit('update:isActive', false)
    },
    applyFilter() {
      if (!this.isValid) return
      
      this.$emit('apply-filter', {
        period: this.selectedPeriod,
        product: this.selectedProduct,
        unit: this.selectedUnit,
      })
      this.closeModal()
    },
    async loadMeasurements(productId) {
      this.loadingMeasurements = true
      this.measurements = []
      try {
        if (navigator.onLine) {
          const measurements = await this.$axios.$get(
            `measurements/product/${productId}`
          )
          this.measurements = measurements || []
        } else {
          // Handle offline case if needed
          this.measurements = []
        }
        
        const currentExists = this.measurements.find(
          m => m.originalName === this.selectedUnit
        )
        
        if (!currentExists && this.measurements.length > 0) {
           this.selectedUnit = this.measurements[0].originalName
        } else if (!currentExists) {
           this.selectedUnit = ''
        }
        
      } catch (error) {
        console.error('Erro ao carregar medidas:', error)
        this.measurements = []
        this.selectedUnit = ''
      } finally {
        this.loadingMeasurements = false
      }
    },
  },
}
</script>

<style scoped>
.teste {
  background-color: #F9F9FB;
}

.filter-section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.filter-title {
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

/* System Standard for Selects based on custom.sass */
.system-select {
  font-size: 16px;
  font-weight: 500;
  border-radius: 20px;
  letter-spacing: -0.2px;
  text-transform: uppercase;
  height: 45px;
  padding-left: 15px;
  border-width: 2px;
  border-color: #852E27;
  background-color: #f2f2f2;
}

.filter-btn {
  transition: all 0.2s ease;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.filter-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.filter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-unselected {
  background-color: #fff !important;
  color: #852E27 !important;
  border: 1px solid #ededed !important;
}

.btn-selected {
  background-color: #852E27 !important;
  color: #fff !important;
  border: 1px solid #852E27 !important;
}

.btn-apply {
  background-color: #852E27 !important;
  color: #fff !important;
  border-radius: 50px !important;
  border: none;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-apply:disabled {
  background-color: #ccc !important;
  color: #666 !important;
  cursor: not-allowed;
}
</style>
