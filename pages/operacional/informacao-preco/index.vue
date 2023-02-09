<template>
  <div class="priceInformation">
    <breadcrumb active="Informações de Preço" />
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
              <b-icon-plus /> {{ 'Cadastrar' }}
            </n-link>
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
            <template #cell(country)="data">
              {{ data.item.country }}
            </template>
            <template #cell(product)="data">
              {{ data.item.product.description }}
            </template>
            <template #cell(minimumPrice)="data">
              {{ data.item.minimumPrice | moeda }}
            </template>
            <template #cell(maximumPrice)="data">
              {{ data.item.maximumPrice | moeda }}
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
          key: 'country',
          label: 'País',
          sortable: true,
        },
        {
          key: 'product.description',
          label: 'produto',
          sortable: true,
        },
        {
          key: 'minimumPrice',
          label: 'preço mínimo',
          sortable: true,
        },
        {
          key: 'maximumPrice',
          label: 'preço máximo',
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
