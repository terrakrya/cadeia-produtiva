<template>
  <b-modal :id="id" title="Regiões imediatas" hide-footer header-close-label="Fechar" close-title="Fechar">
    <div class="square-translator">
      <table
        v-for="(a, index) in groupedlist"
        :key="index"
        class="table b-table text-left mb-5"
      >
        <thead>
          <tr>
            <th style="text-align: left !important">
              <strong>{{ index }}</strong>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <table>
              <tbody v-for="(dados, index2) in a" :key="index2">
                <td style="width: 30%">
                  <small>{{ dados.estado }}</small>
                </td>
                <td style="width: 70%">
                  <small>{{ dados.cidade }}</small>
                </td>
              </tbody>
            </table>
          </tr>
        </tbody>
      </table>
    </div>
    <b-button
      class="btn btn-primary"
      variant="danger"
      block
      @click="$bvModal.hide(id)"
      >Fechar</b-button
    >
  </b-modal>
</template>
<script>
import squares from '@/data/praca.json'
export default {
  name: 'FormSquareTranslator',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      squares,
      groupedlist: [],
    }
  },
  created() {
    this.list()
  },
  methods: {
    list() {
      function groupBy(arr, property) {
        return arr.reduce(function (memo, x) {
          if (!memo[x[property]]) {
            memo[x[property]] = []
          }
          memo[x[property]].push(x)
          return memo
        }, {})
      }
      const groupedlist = groupBy(squares, 'nome')
      this.groupedlist = groupedlist
    },
  },
}
</script>
<style>
.square-translator {
  .table table {
    width: 100%;
    font-size: 12px;
  }
}
</style>
