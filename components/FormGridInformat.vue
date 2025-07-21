<template>
  <div v-if="list && list.length">
    <div class="d-flex justify-content-end mb-2">
      <small class="text-muted">Exibindo {{ list.length }} registro(s)</small>
    </div>
    <b-table
      class="table b-table b-table-stacked-md table-striped"
      :fields="table_fields"
      :items="list"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      stacked="lg"
    >
      <template #cell(from)="data">
        {{ data.item.buyerFrom }}
      </template>
      <template #cell(to)="data">
        {{ data.item.buyerTo }}
      </template>
      <template #cell(messenger)="data">
        {{ data.item.messenger }}
      </template>
      <template #cell(region)="data">
        {{ data.item.region || 'Não informado' }}
      </template>
      <template #cell(city)="data">
        {{ data.item.city }}
      </template>
      <template #cell(date)="data">
        {{ data.item.date }}
      </template>
      <template #cell(averagePrice)="data">
        {{ convertPrice(data.item.averagePrice) | moeda }}
      </template>
      <template #cell(minimumPrice)="data">
        {{ convertPrice(data.item.minimumPrice) | moeda }}
      </template>
      <template #cell(maximumPrice)="data">
        {{ convertPrice(data.item.maximumPrice) | moeda }}
      </template>
    </b-table>
  </div>
  <div v-else>
    <p class="text-center text-muted">Nenhum registro encontrado.</p>
  </div>
</template>
<script>
export default {
  name: 'FormGridInformat',
  props: {
    list: [],
  },
  data() {
    return {
      sortBy: 'date',
      sortDesc: true,
      userMeasurement: null,
    }
  },
  computed: {
    table_fields() {
      const userMeasure = this.$auth.user.unitOfMeasurement 

      return [
        {
          key: 'buyerFrom',
          label: 'De',
          sortable: true
        },
        {
          key: 'buyerTo',
          label: 'Para',
          sortable: true
        },
        {
          key: 'messenger',
          label: 'Mensageiro',
          sortable: true
        },
        {
          key:'city',
          label: 'Município',
          sortable: true
        },
        {
          key: 'region',
          label: 'Região Castanheira',
          sortable: true
        },
        {
          key: 'date',
          label: 'Data',
          sortable: true,
          sortByFormatted: true,
          formatter: value => new Date(value.split('/').reverse().join('-'))
        },
        {
          key: 'averagePrice',
          label: `Preço médio (${userMeasure})`,
          sortable: true
        },
        {
          key: 'minimumPrice',
          label: `Preço Mínimo (${userMeasure})`,
          sortable: true
        },
        {
          key: 'maximumPrice',
          label: `Preço Máximo (${userMeasure})`,
          sortable: true
        }
      ];
    }
  },
  async created() {
    await this.loadUserMeasurement()
  },
  methods: {
    async loadUserMeasurement() {
      try {
        if (this.$auth.user.measurementId) {
          const measurement = await this.$axios.$get(
            `measurements/${this.$auth.user.measurementId}`
          )
          this.userMeasurement = measurement
        }
      } catch (error) {
        console.error('Erro ao carregar medida do usuário:', error)
        this.userMeasurement = null
      }
    },

    convertPrice(price) {
      if (this.userMeasurement && this.userMeasurement.referenceInKg) {
        return price * this.userMeasurement.referenceInKg
      }
      
      return price || 0
    },
  }
}
</script>
