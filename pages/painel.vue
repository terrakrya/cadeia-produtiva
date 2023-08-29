<template>
  <div class="SpeciesProduct">
    <breadcrumb active="Dados publicados" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6"></div>
          <div class="col-sm-6 main-actions">
            <n-link to="/graficos" class="btn btn-primary">
              {{ 'Gráficos' }}
            </n-link>
            <div>
              <b-button
                id="show-btn"
                class="btn btn-primary"
                variant="danger"
                @click="$bvModal.show('bv-modal')"
                >Tradutor de medidas</b-button
              >

              <b-button
                id="show-btn"
                class="btn btn-primary"
                variant="danger"
                @click="$bvModal.show('bv-modal-1')"
                >Tradutor de praça</b-button
              >
              <b-button
                id="show-btn"
                class="btn btn-primary"
                variant="danger"
                @click="$bvModal.show('bv-modal-2')"
                >Nota metodologica</b-button
              >

              <FormSquareTranslator id="bv-modal-1" />
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
                  :options="estados"
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
              <b-form-group label="Praça">
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
                  :options="posicaoComprador"
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
import posicaoComprador from '@/data/posicao-do-comprador.json'
import buyerPositions from '@/data/posicao-do-comprador.json'
export default {
  components: {
    Breadcrumb,
    FormGridInformat,
    FormSquareTranslator,
    FormMeasureTranslator,
    FormMetodologia,
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
      posicaoComprador,
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
      } else {
        this.filters.uf = this.$auth.user.uf
        this.filters.city = this.$auth.user.city
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
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]

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

    // filtra as praça conforme a cidade selecionada
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
