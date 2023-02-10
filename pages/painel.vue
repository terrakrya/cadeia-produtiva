<template>
  <div class="SpeciesProduct">
    <breadcrumb active="Dados publicados" />
    <div class="panel">
      <div class="panel-body">
        <div class="info-content">
          <div class="row">
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
              <b-form-group label="Cidade">
                <b-form-select
                  v-model="filters.city"
                  class="form-control"
                  :options="cidades"
                  @input="loadPracas(true)"
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
            <div class="col-sm-4">
              <b-form-group label="Produto">
                <b-form-select
                  v-model="filters.product"
                  class="form-control"
                  :options="products"
                  value-field="_id"
                  text-field="description"
                  @input="applyFilters"
                />
              </b-form-group>
            </div>
          </div>
          <br />
          <no-item :list="priceInformations" />
          <b-table
            v-if="priceInformations && priceInformations.length"
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="priceInformations"
          >
            <template #cell(local)="data">
              {{ data.item.city }}
              /
              {{ data.item.uf }}
            </template>
            <template #cell(createdAt)="data">
              {{ data.item.createdAt | moment('DD/MM/YYYY') }}
            </template>
            <template #cell(product)="data">
              {{ data.item.product.code }}
            </template>
            <template #cell(price)="data">
              {{ data.item.minimumPrice | moeda }}
              /
              {{ data.item.maximumPrice | moeda }}
              /
              {{
                ((data.item.minimumPrice + data.item.maximumPrice) / 2) | moeda
              }}
            </template>
          </b-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import pracas from '@/data/praca.json'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      filters: {
        uf: '',
        city: '',
        square: null,
        from: null,
        to: null,
        product: '',
      },
      estados,
      cidades,
      pracas,
      table_fields: [
        {
          key: 'local',
          label: 'Cidade/estado',
          sortable: true,
        },
        {
          key: 'createdAt',
          label: 'Data',
          sortable: true,
        },
        {
          key: 'product.description',
          label: 'Produto',
          sortable: true,
        },
        {
          key: 'price',
          label: 'Preços: mínimo/máximo/média',
          sortable: true,
        },
      ],
      priceInformations: [],
      products: [],
    }
  },

  async created() {
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
      const products = [{ _id: '', description: 'Selecione o produto' }]
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
      if (this.filters.product) {
        filters.product = this.filters.product
      }

      this.priceInformations = await this.$axios.$get('price-informations', {
        params: {
          filters,
        },
      })
    },
  },
}
</script>
