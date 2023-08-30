<template>
  <b-modal :id="id">
    <template>
      <div class="square-translator">
        <table v-for="(a, index) in groupedlist" :key="index" class="table">
          <tr>
            <td>
              <strong>{{ index }}</strong>
            </td>
          </tr>
          <tr>
            <thead>
              <td>
                <strong>UF</strong>
              </td>
              <td>
                <strong>Município</strong>
              </td>
            </thead>
            <tbody v-for="(dados, index2) in a" :key="index2">
              <td style="width: 30%">
                <small>{{ dados.estado }}</small>
              </td>
              <td style="width: 70%">
                <small>{{ dados.cidade }}</small>
              </td>
            </tbody>
          </tr>
        </table>
      </div>
    </template>
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
  .table table,
  td,
  thead {
    text-align: center;
    width: 300px;
    border-collapse: collapse;
  }

  .square-translator th,
  td {
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 5px;
  }
}
</style>
