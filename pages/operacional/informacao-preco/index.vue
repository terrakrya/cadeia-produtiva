<template>
  <div class="priceInformation">
    <breadcrumb active="Histórico de Preços Informados" />
    <div class="panel">
      <div class="panel-body">
        <div class="panel-title">
          <div class="d-flex justify-content-between">
            <div>
              <b-button
                id="show-btn"
                variant="secondary"
                @click="$bvModal.show('bv-modal')"
                >Medidas</b-button
              >
              <FormMeasureTranslator id="bv-modal" />
            </div>
            <div class="text-right">
              <n-link
                to="/operacional/informacao-preco/cadastrar"
                class="btn btn-primary"
              >
                <b-icon-plus /> {{ 'Registrar' }}
              </n-link>
            </div>
          </div>
        </div>
        <div class="info-content">
          <div v-if="loading" class="text-center">
            <Loading loading />
          </div>
          <div v-else>
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
              stacked="lg"
            >
              <template #cell(createdAt)="data">
                {{ data.item.createdAt | moment('DD/MM/YYYY') }}
              </template>
              <template #cell(messenger)="data">
                {{ data.item.messenger.name }}
              </template>
              <template #cell(organization)="data">
                <span v-if="data.item.organization">{{
                  data.item.organization.sigla
                }}</span>
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
                <small
                  v-if="data.item.measure != 'Kg'"
                  class="text-muted"
                  style="font-size: 11px"
                  @click="$bvModal.show('bv-modal')"
                >
                  <br />
                  {{ data.item.minimumPrice | moeda }}/Kg
                </small>
              </template>
              <template #cell(maximumPrice)="data">
                {{ data.item.originalMaximumPrice | moeda }}
                <small
                  v-if="data.item.measure != 'Kg'"
                  class="text-muted"
                  style="font-size: 11px"
                  @click="$bvModal.show('bv-modal')"
                >
                  <br />
                  {{ data.item.maximumPrice | moeda }}/Kg
                </small>
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
      loading: true,
      filters: { search: null },
      table_fields: [],
      priceInformations: [],
    }
  },

  async created() {
    this.loading = true
    await this.list()
    this.fillTableFields()
    this.loading = false
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
