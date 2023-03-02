<template>
  <b-table
    v-if="list && list.length"
    class="table b-table b-table-stacked-md table-striped"
    :fields="table_fields"
    :items="list"
  >
    <template #cell(messenger)="data">
      {{ data.item.messenger.name }}
    </template>
    <template #cell(buyerPosition)="data">
      {{ data.item.buyerPosition }}
    </template>
    <template #cell(createdAt)="data">
      {{ data.item.createdAt | moment('DD/MM/YYYY') }}
    </template>
    <template #cell(price)="data">
      {{ data.item.minimumPrice | moeda }}
      /
      {{ data.item.maximumPrice | moeda }}
      /
      {{ ((data.item.minimumPrice + data.item.maximumPrice) / 2) | moeda }}
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
      table_fields: [
        {
          key: 'messenger.name',
          label: 'De',
          sortable: true,
        },
        {
          key: 'buyerPosition',
          label: 'Para',
          sortable: true,
        },
        {
          key: 'createdAt',
          label: 'Data',
          sortable: true,
        },
        {
          key: 'price',
          label: 'Preços: mínimo/máximo/média',
          sortable: true,
        },
      ],
    }
  },
}
</script>
