<template>
    <b-modal :id="id">
        <template>
    <b-table
    class="table b-table b-table-stacked-md table-striped"
    :fields="table_fields"
    :items="pracas"
  >
    <template #cell(uf)="data">
      {{ data.item.estado }}
    </template>
    <template #cell(city)="data">
      {{ data.item.cidade }}
    </template>
    <template #cell(square)="data">
      {{ data.item.nome }}
    </template>
  </b-table>
</template>
</b-modal>
</template>
<script>
import pracas from '@/data/praca.json'
export default {
  name: 'FormSquareTranslator',
  props: {
    id: '',
  },
  data() {
    return {
      pracas,
      table_fields: [
        {
          key: 'uf',
          label: 'Estado',
        },
        {
          key: 'city',
          label: 'cidade',
        },
        {
          key: 'square',
          label: 'Praça',
        },
      ],
    }
  },
}
</script>

