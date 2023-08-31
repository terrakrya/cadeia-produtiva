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
                >Coleta de preços</b-button
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
                >Regiões</b-button
              >
              <b-button
                id="show-btn"
                class="btn btn-primary"
                variant="danger"
                @click="$bvModal.show('bv-modal-2')"
                >Metodologia</b-button
              >

              <FormSquareTranslator id="bv-modal-1" />
              <FormMeasureTranslator id="bv-modal" />
              <FormMetodologia id="bv-modal-2" />
            </div>
          </div>
        </div>
        <div class="info-content">
          <div>
            <div v-if="loading" class="text-center">
              <Loading loading />
            </div>
            <div v-else>
              <b-row v-if="summary" class="text-center">
                <b-col>
                  <div class="text-muted">Mínimo</div>
                  <div class="p-2 price-info">
                    {{ summary.minimumPrice | moeda }}
                  </div>
                </b-col>
                <b-col>
                  <div class="text-muted">Médio</div>
                  <div class="p-2 price-info">
                    {{ summary.averagePrice | moeda }}
                  </div>
                </b-col>
                <b-col>
                  <div class="text-muted">Máximo</div>
                  <div class="p-2 price-info">
                    {{ summary.maximumPrice | moeda }}
                  </div>
                </b-col>
              </b-row>

              <hr />
              <h4 class="text-center">Preço médio por região</h4>
              <div class="pt-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import FormSquareTranslator from '@/components/FormSquareTranslator'
import FormMeasureTranslator from '@/components/FormMeasureTranslator'
import FormMetodologia from '@/components/FormMetodologia.vue'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import squares from '@/data/praca.json'
import buyerPositions from '@/data/posicao-do-comprador.json'
export default {
  components: {
    Breadcrumb,

    FormSquareTranslator,
    FormMeasureTranslator,
    FormMetodologia,
  },
  data() {
    return {
      loading: false,
      filters: {
        product: '',
        buyerPosition: '',
      },
      buyerPositions,
      estados,
      cidades,
      squares,
      priceInformations: [],
      products: [],
    }
  },
  computed: {
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
    this.loading = true
    await this.load()
    await this.loadProducts()
    this.loading = false
  },
  methods: {
    async loadProducts() {
      const products = await this.$axios.$get('products')
      this.products = products
    },

    async load() {
      this.summary = await this.$axios.$get('price-informations/summary', {
        params: this.filters,
      })
    },
  },
}
</script>
