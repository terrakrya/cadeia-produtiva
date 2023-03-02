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
                @click="$bvModal.show('bv-modal')"
                >Tradutor de medidas</b-button
              >

              <b-modal id="bv-modal" hide-footer>
                <template #modal-title> Conversões</template>
                <table class="table b-table b-table-stacked-md table-striped">
                  <thead>
                    <tr>
                      <th>Unidade</th>
                      <!--<th>Lata</th>
                      <th>Litros</th>-->
                      <th>Kg</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <td>Lata/Latão</td>
                    <!--<td>1</td>
                    <td>20</td>-->
                    <td>12</td>
                  </tbody>
                  <tbody>
                    <td>Caixa</td>
                    <!--<td>2</td>
                    <td>40</td>-->
                    <td>24</td>
                  </tbody>
                  <tbody>
                    <td>Hectolitro</td>
                    <!--<td>5</td>
                    <td>100</td>-->
                    <td>60</td>
                  </tbody>
                  <tbody>
                    <td>Saca</td>
                    <!--<td>5</td>
                    <td>100</td>-->
                    <td>60</td>
                  </tbody>
                  <tbody>
                    <td>Barrica</td>
                    <!--<td>6</td>
                    <td>120</td>-->
                    <td>72</td>
                  </tbody>
                  <tbody>
                    <td>Tonelada</td>
                    <!--<td></td>
                    <td></td>-->
                    <td>1000</td>
                  </tbody>
                </table>
                <b-button
                  class="btn btn-primary"
                  variant="danger"
                  block
                  @click="$bvModal.hide('bv-modal')"
                  >Fechar</b-button
                >
              </b-modal>
            </div>
          </div>
        </div>
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
          <form-grid-informat :list="priceInformations" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import FormGridInformat from '@/components/FormGridInformat'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import pracas from '@/data/praca.json'
export default {
  components: {
    Breadcrumb,
    FormGridInformat,
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
