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
import FormRegionsTranslator from '@/components/FormRegionsTranslator'
import FormMeasureTranslator from '@/components/FormMeasureTranslator'
import FormMetodologia from '@/components/FormMetodologia.vue'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import regions from '@/data/regioes-castanheiras.json'
import buyerPositions from '@/data/posicao-do-comprador.json'
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
  },
}
</script>
