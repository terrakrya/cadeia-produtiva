<template>
  <b-table
    v-if="list && list.length"
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
    <template #cell(price)="data">
      {{ convertPrice(data.item.minimumPrice) | moeda }}
      / 
      {{ convertPrice(data.item.maximumPrice) | moeda }}
    </template>
  </b-table>
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
    }
  },
  computed: {
    table_fields() {
      const unit = this.$auth.user.unitOfMeasurement;
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
          label: `Preço médio (${unit})`,
          sortable: true
        },
        {
          key: 'price',
          label: `Mínimo/Máximo (${unit})`,
          sortable: false
        }
      ];
    }
  },
  methods: {
    convertPrice(price) {
      const unit = this.$auth.user.unitOfMeasurement;
      const conversionRates = {
        'Kg': 1,
        'Tonelada': 1000,
        'Lata': 12,
        'Caixa': 24,
        'Hectolitro': 60,
        'Saca': 48,
        'Barrica': 72
      };
      return price * (conversionRates[unit] || 1);
    }
  }
}
</script>
