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
            <!-- Controles de paginação e informações -->
            <div
              v-if="priceInformations.length > 0"
              class="d-flex justify-content-between align-items-center mb-3"
            >
              <div>
                <small class="text-muted">
                  Exibindo {{ startRecord }} - {{ endRecord }} de
                  {{ totalRows }} registro(s)
                </small>
              </div>
              <div class="d-flex align-items-center">
                <small class="text-muted mr-2">Itens por página:</small>
                <b-form-select
                  v-model="perPage"
                  :options="perPageOptions"
                  size="sm"
                  class="pagination-per-page-select"
                  style="width: auto"
                  @change="onPerPageChange"
                />
              </div>
            </div>

            <PriceInformationTable
              :priceInformations="priceInformations"
              :tableFields="table_fields"
              v-model="filters.search"
              @remove="remove"
            />

            <!-- Paginação -->
            <div
              v-if="priceInformations.length > 0 && totalPages > 1"
              class="d-flex justify-content-center mt-3"
            >
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPage"
                @change="onPageChange"
                size="sm"
                class="custom-pagination mb-0"
              />
            </div>
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
    FormMeasureTranslator,
  },
  data() {
    return {
      translator: true,
      loading: true,
      filters: { search: null },
      table_fields: [],
      priceInformations: [],
      currentPage: 1,
      perPage: 50,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 25, text: '25' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
      ],
      totalRows: 0,
      totalPages: 0,
    }
  },

  computed: {
    startRecord() {
      if (this.totalRows === 0) return 0
      return (this.currentPage - 1) * this.perPage + 1
    },

    endRecord() {
      const end = this.currentPage * this.perPage
      return end > this.totalRows ? this.totalRows : end
    },
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
      try {
        const response = await this.$axios.$get('price-informations', {
          params: {
            page: this.currentPage,
            limit: this.perPage,
          },
        })

        this.priceInformations = response.data
        this.totalRows = response.pagination.total
        this.totalPages = response.pagination.pages
      } catch (error) {
        this.showError(error)
      }
    },

    async onPageChange(page) {
      this.currentPage = page
      this.loading = true
      await this.list()
      this.loading = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    onPerPageChange() {
      this.currentPage = 1
      this.loading = true
      this.list().finally(() => {
        this.loading = false
      })
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
