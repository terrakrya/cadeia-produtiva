<template>
  <div class="SpeciesProduct">
    <breadcrumb />
    <div class="panel">
      <div class="panel-body">
        <div class="info-content">
          <div class="row">
            <div class="text-right col-sm-8">
              <input
                v-model="filters.search"
                type="search"
                :placeholder="'Buscar'"
                class="form-control search-input"
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
            :filter="filters.search"
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
  },
}
</script>
