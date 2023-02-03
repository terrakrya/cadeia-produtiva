<template>
  <div class="SpeciesProduct">
    <breadcrumb />
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
                  @input="loadCities()"
                />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Cidade">
                <b-form-select
                  v-model="filters.city"
                  class="form-control"
                  :options="cidades"
                  @input="loadPracas()"
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
            <div class="col-sm-4 from_to">
              <b-form-input
                v-model="filters.from"
                :label="'Data incial'"
                type="date"
                @input="applyFilters"
              />
              <b-form-input
                v-model="filters.to"
                :label="'Data final'"
                type="date"
                @input="applyFilters"
              />
            </div>
          </div>
          <br />
          <no-item :list="priceInformations" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="priceInformations"
            :sort-by="'name'"
            :filter="filters"
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
              {{ data.item.MinimumPrice | moeda }}
              /
              {{ data.item.MaximumPrice | moeda }}
              /
              {{
                ((data.item.MinimumPrice + data.item.MaximumPrice) / 2) | moeda
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
        uf: null,
        city: null,
        square: null,
        from: null,
        to: null,
      },
      estados,
      cidades,
      pracas,
      table_fields: [
        {
          key: 'local',
          label: 'cidade/estado',
          sortable: true,
        },
        {
          key: 'createdAt',
          label: 'Data',
          sortable: true,
        },
        {
          key: 'product',
          label: 'Produto',
          sortable: true,
        },
        {
          key: 'price',
          label: 'Preços: mínimo/máximo/media',
          sortable: true,
        },
      ],
      priceInformations: [],
    }
  },

  async created() {
    await this.list()
  },
  methods: {
    async list() {
      this.priceInformations = await this.$axios.$get('priceInformations')
    },
    loadCities() {
      // lista de cidades com somente o item "selecione a cidade"
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]

      // filtra as cidades conforme a UF selecionada
      if (this.filters.uf) {
        this.cidades = this.cidades.concat(Object(cidades)[this.filters.uf])
      }

      // limpa a cidade digitada, caso não exista na lista
      if (this.filters.city && this.cidades) {
        if (!this.cidades.find((c) => c === this.filters.city)) {
          this.filters.city = ''
        }
      }
    },

    // filtra as praça conforme a cidade selecionada
    loadPracas() {
      if (this.filters.city) {
        const cidade = this.filters.city
        const pracas = this.pracas.filter(function (item) {
          return item.cidade === cidade
        })
        if (pracas && pracas.length > 0) {
          this.filters.square = pracas[0].nome
        }
      }
    },
  },
}
</script>
