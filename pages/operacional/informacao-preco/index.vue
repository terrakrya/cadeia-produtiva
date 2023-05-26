<template>
  <div class="priceInformation">
    <breadcrumb active="Coleta de preços" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Coleta de preços</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link
              to="/operacional/informacao-preco/cadastrar"
              class="btn btn-primary"
            >
              <b-icon-plus /> {{ 'Registrar' }}
            </n-link>
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
          <div class="text-right">
            <input
              v-model="filters.search"
              type="search"
              :placeholder="'Buscar'"
              class="form-control search-input"
            />
          </div>
          <br />
          <no-item :list="priceInformations" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="priceInformations"
            :sort-by="'product'"
            :filter="filters.search"
          >
            <template #cell(createdAt)="data">
              {{ data.item.createdAt | moment('DD/MM/YYYY') }}
            </template>
            <template #cell(messenger)="data">
              {{ data.item.messenger.name }}
            </template>
            <template #cell(buyerPosition)="data">
              {{ data.item.buyerPosition }}
            </template>
            <template #cell(uf)="data">
              {{ data.item.uf }}
            </template>
            <template #cell(city)="data">
              {{ data.item.city }}
            </template>
            <template #cell(square)="data">
              {{ data.item.square }}
            </template>
            <template #cell(product)="data">
              {{ data.item.product.name }}
            </template>
            <template #cell(measure)="data">
              {{ data.item.measure }}
            </template>
            <template #cell(minimumPrice)="data">
              {{ data.item.originalMinimumPrice | moeda }}
            </template>
            <template #cell(maximumPrice)="data">
              {{ data.item.originalMaximumPrice | moeda }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="
                  '/operacional/informacao-preco/' + data.item._id + '/editar'
                "
                class="btn btn-secondary"
              >
                <b-icon-pencil />
              </n-link>
              <a class="btn btn-secondary" @click="remove(data.item._id)">
                <b-icon-trash />
              </a>
            </template>
          </b-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      translator: true,
      filters: { search: null },
      table_fields: [
        {
          key: 'createdAt',
          label: 'Data',
          sortable: true,
        },
        {
          key: 'messenger.name',
          label: 'Mensageiro',
          sortable: true,
        },
        {
          key: 'buyerPosition',
          label: 'Posição comercial',
          sortable: true,
        },
        {
          key: 'uf',
          label: 'Estado',
          sortable: true,
        },
        {
          key: 'city',
          label: 'Município',
          sortable: true,
        },
        {
          key: 'square',
          label: 'Praça',
          sortable: true,
        },
        {
          key: 'product',
          label: 'Produto',
          sortable: true,
        },
        {
          key: 'measure',
          label: 'Unidade ',
          sortable: true,
        },
        {
          key: 'minimumPrice',
          label: 'Preço mínimo',
          sortable: true,
        },
        {
          key: 'maximumPrice',
          label: 'Preço máximo',
          sortable: true,
        },
        {
          key: 'actions',
          label: 'Ação',
          class: 'actions',
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
      const filters = {}

      if (this.isAdmin || this.isGlobalManager) {
        filters.organization = '!organization'
      } else if (this.isManager) {
        filters.organization = this.currentUser.organization
      }

      const priceInformations = await this.$axios.$get('price-informations')

      if (this.isMessenger) {
        this.priceInformations = priceInformations.filter((i) => {
          return i.messenger.id === this.currentUser.id
        })
      } else {
        this.priceInformations = priceInformations
      }
      
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('price-informations/' + id)
              .then(() => {
                this.list()
              })
              .catch(this.showError)
          }
        })
    },
  },
}
</script>
