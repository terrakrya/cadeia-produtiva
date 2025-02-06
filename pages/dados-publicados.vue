<template>
  <div class="SpeciesProduct">
    <breadcrumb active="Dados publicados" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6"></div>
          <div class="col-sm-6 main-actions">
            <div>
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
            </div>
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
                  @input="applyFilters"
                />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
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
            <b-col sm="4">
              <b-form-group label="Região Castanheira">
                <b-form-select
                  v-model="filters.region"
                  :options="regionOptions"
                  @input="applyFilters"
                  class="form-control"
                />
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
          <b-button
            variant="danger"
            class="btn btn-primary"
            style="margin-bottom: 12px"
            @click="downloadExcel"
          >
            Download Excel
          </b-button>
          <br />
          <no-item :list="priceInformations" />
          <form-grid-informat ref="gridInformat" :list="priceInformations" />
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
  },
  data() {
    return {
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
    }
  },

  async created() {
    if (
      this.$auth.user.role === 'mensageiro' ||
      this.$auth.user.role === 'gestor'
    ) {
      this.$router.push('/painel')
    }
    await this.loadCities(false)
    await this.applyFilters()
    await this.loadProducts()

    this.regionOptions = [
      { value: '', text: 'Todas as regiões' },
      ...[...new Set(regions.map((r) => r.regiaoCastanheira))].map((reg) => ({
        value: reg,
        text: reg,
      })),
    ]
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
        filters.region = this.filters.region
      }

      this.priceInformations = await this.$axios.$get(
        'price-informations/data-published',
        {
          params: {
            filters,
          },
        }
      )
    },

    downloadExcel() {
      // Retrieve the sorting parameters from the FormGridInformat component
      const grid = this.$refs.gridInformat
      const sortKey = grid ? grid.sortBy : 'date'
      const sortDesc = grid ? grid.sortDesc : true

      // Clone and sort the data according to the current sorting settings
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
        [`Preço médio (${unit})`]: this.convertPrice(item.averagePrice),
        [`Preço Mínimo (${unit})`]: this.convertPrice(item.minimumPrice),
        [`Preço Máximo (${unit})`]: this.convertPrice(item.maximumPrice),
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
      link.download = 'dados-publicados.xlsx'
      link.click()
      URL.revokeObjectURL(url)
    },

    convertPrice(price) {
      const unit = this.$auth.user.unitOfMeasurement
      const conversionRates = {
        Kg: 1,
        Tonelada: 1000,
        Lata: 12,
        Caixa: 24,
        Hectolitro: 60,
        Saca: 48,
        Barrica: 72,
      }
      return price * (conversionRates[unit] || 1)
    },
  },
}
</script>
