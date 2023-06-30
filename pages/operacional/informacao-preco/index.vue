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
                      <th>Kg</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <td>Lata/Latão</td>
                    <td>12</td>
                  </tbody>
                  <tbody>
                    <td>Caixa</td>
                    <td>24</td>
                  </tbody>
                  <tbody>
                    <td>Hectolitro</td>
                    <td>60</td>
                  </tbody>
                  <tbody>
                    <td>Saca</td>
                    <td>60</td>
                  </tbody>
                  <tbody>
                    <td>Barrica</td>
                    <td>72</td>
                  </tbody>
                  <tbody>
                    <td>Tonelada</td>
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
            <template #cell(organization)="data">
              {{ data.item.organization.sigla }}
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
import { isAdmin, isGlobalManager, isManager } from '~/api/config/auth'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      translator: true,
      filters: { search: null },
      table_fields: [],
      priceInformations: [],
    }
  },

  async created() {
    await this.list()
    this.fillTableFields();
  },
  methods: {
    fillTableFields() {
      let table_fields = [{ key: 'createdAt', label: 'Data', sortable: true }]

      if (this.isAdmin || this.isManager || this.isGlobalManager) {
        table_fields.push({ key: 'messenger.name', label: 'Mensageiro', sortable: true })
      }

      if (this.isAdmin || this.isGlobalManager) {
        table_fields.push({ key: 'organization', label: 'Organização', sortable: true })
      }

      table_fields.push({ key: 'buyerPosition', label: 'Posição comercial', sortable: true })
      table_fields.push({ key: 'uf', label: 'Estado', sortable: true })
      table_fields.push({ key: 'city', label: 'Município', sortable: true })

      if (this.isAdmin || this.isGlobalManager) {
        table_fields.push({ key: 'square', label: 'Praça', sortable: true })
      }

      table_fields.push({ key: 'product', label: 'Produto', sortable: true })
      table_fields.push({ key: 'measure', label: 'Unidade', sortable: true })
      table_fields.push({ key: 'minimumPrice', label: 'Preço mínimo', sortable: true })
      table_fields.push({ key: 'maximumPrice', label: 'Preço máximo', sortable: true })
      table_fields.push({ key: 'actions', label: 'Ação', class: 'actions' })

      this.table_fields = table_fields
    },
    async list() {
      const priceInformations = await this.$axios.$get('price-informations')

      if (this.isMessenger) {
        this.priceInformations = priceInformations.filter((i) => {
          return i.messenger.id === this.currentUser.id
        })
      } else if (this.isManager) {
        this.priceInformations = priceInformations.filter((i) => {
          return i.organization === this.currentUser.organization
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
