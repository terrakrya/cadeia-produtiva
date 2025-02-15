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
                <b-icon-plus /> {{ 'Coletar' }}
              </n-link>
            </div>
          </div>
        </div>
        <div class="info-content">
          <div v-if="loading" class="text-center">
            <Loading loading />
          </div>
          <div v-else>
            <PriceInformationTable
              :priceInformations="priceInformations"
              :tableFields="table_fields"
              v-model="filters.search"
              @remove="remove"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import PriceInformationTable from '@/components/PriceInformationTable'
import FormMeasureTranslator from '@/components/FormMeasureTranslator'

export default {
  components: {
    Breadcrumb,
    PriceInformationTable,
    FormMeasureTranslator
  },
  data() {
    return {
      translator: true,
      loading: true,
      filters: { search: null },
      table_fields: [],
      priceInformations: []
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
      const tableFields = [{ key: 'product', label: 'Produto', sortable: true }]

      tableFields.push({ key: 'createdAt', label: 'Data', sortable: true })

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
        label: 'Relação comercial',
        sortable: true,
      })
      tableFields.push({ key: 'uf', label: 'Estado', sortable: true })
      tableFields.push({ key: 'city', label: 'Município', sortable: true })

      if (this.isAdmin || this.isGlobalManager) {
        tableFields.push({
          key: 'region',
          label: 'Região Castanheira',
          sortable: true,
        })
      }
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
      tableFields.push({
        key: 'totalTransactionValue',
        label: 'Valor da transação',
        sortable: true,
      })
      tableFields.push({
        key: 'transactedQuantity',
        label: 'Quantidade transacionada',
        sortable: true,
      })
      tableFields.push({ key: 'measure', label: 'Unidade', sortable: true })

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
