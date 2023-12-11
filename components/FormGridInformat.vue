<template>
  <b-table
    v-if="list && list.length"
    class="table b-table b-table-stacked-md table-striped"
    :fields="table_fields"
    :items="list"
    :sort-by="'date'"
    stacked="lg"
  >
    <template #cell(from)="data">
      {{ data.item.from }}
    </template>
    <template #cell(to)="data">
      {{ data.item.to }}
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
      table_fields: [
        {
          key: 'from',
          label: 'De',
        },
        {
          key: 'to',
          label: 'Para',
        },
        {
          key: 'date',
          label: 'Data',
        },
        {
          key: 'averagePrice',
          label: 'Preço médio',
        },
        {
          key: 'price',
          label: 'Mínimo/Máximo',
        },
      ],
    }
  },
}
</script>
