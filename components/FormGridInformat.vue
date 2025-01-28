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
      {{ data.item.from }}
    </template>
    <template #cell(to)="data">
      {{ data.item.to }}
    </template>
    <template #cell(messenger)="data">
      {{ data.item.messenger }}
    </template>
    <template #cell(region)="data">
      {{ data.item.region || 'Não informado' }}
    </template>
    <template #cell(date)="data">
      {{ data.item.date }}
    </template>
    <template #cell(averagePrice)="data">
      {{ data.item.averagePrice | moeda }}
    </template>
    <template #cell(price)="data">
      {{ data.item.minimumPrice | moeda }}
      /
      {{ data.item.maximumPrice | moeda }} </template
    >]
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
      table_fields: [
        {
          key: 'from',
          label: 'De',
          sortable: true
        },
        {
          key: 'to',
          label: 'Para',
          sortable: true
        },
        {
          key: 'messenger',
          label: 'Mensageiro',
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
          label: 'Preço médio',
          sortable: true
        },
        {
          key: 'price',
          label: 'Mínimo/Máximo',
          sortable: false // Não ordenável por ser um campo composto
        }
      ],
    }
  },
}
</script>
