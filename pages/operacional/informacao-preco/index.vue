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
            <b-button
              id="show-btn"
              class="btn btn-primary"
              variant="danger"
              @click="$bvModal.show('bv-modal')"
              >Medidas</b-button
            >
            <n-link
              to="/operacional/informacao-preco/cadastrar"
              class="btn btn-primary"
            >
              <b-icon-plus /> {{ 'Registrar' }}
            </n-link>
            <div>
              <FormMeasureTranslator id="bv-modal" />
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
    this.fillTableFields()
  },
  methods: {
    fillTableFields() {
      const tableFields = [{ key: 'createdAt', label: 'Data', sortable: true }]

      if (this.isAdmin || this.isManager || this.isGlobalManager) {
        tableFields.push({
          key: 'messenger.name',
          label: 'Mensageiro',
          sortable: true,
        })
      }

      if (this.isAdmin || this.isGlobalManager) {
        tableFields.push({
          key: 'organization',
          label: 'Organização',
          sortable: true,
        })
      }

      tableFields.push({
        key: 'buyerPosition',
        label: 'Posição comercial',
        sortable: true,
      })
      tableFields.push({ key: 'uf', label: 'Estado', sortable: true })
      tableFields.push({ key: 'city', label: 'Município', sortable: true })

      if (this.isAdmin || this.isGlobalManager) {
        tableFields.push({
          key: 'square',
          label: 'Região Imediata',
          sortable: true,
        })
      }

      tableFields.push({ key: 'product', label: 'Produto', sortable: true })
      tableFields.push({ key: 'measure', label: 'Unidade', sortable: true })
      tableFields.push({
        key: 'minimumPrice',
        label: 'Preço mínimo',
        sortable: true,
      })
      tableFields.push({
        key: 'maximumPrice',
        label: 'Preço máximo',
        sortable: true,
      })
      tableFields.push({ key: 'actions', label: 'Ação', class: 'actions' })

      this.table_fields = tableFields
    },
    async list() {
      this.priceInformations = await this.$axios.$get('price-informations')
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
