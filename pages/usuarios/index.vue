<template>
  <div class="user">
    <breadcrumb :active="'Usuários'" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Usuários</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link to="/usuarios/cadastrar" class="btn btn-primary">
              <b-icon-plus /> {{ 'Cadastrar' }}
            </n-link>
          </div>
        </div>
        <div class="info-content">
          <table class="table b-table b-table-stacked-md table-striped">
            <thead>
              <tr>
                <th>nome</th>
                <th>Localidade</th>
                <th>Perfil</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <small>{{}}</small>
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Breadcrumb from '@/components/Breadcrumb'
export default {
  data() {
    return {
      filters: { search: null },
      table_fields: [],
      users: null,
      Breadcrumb,
    }
  },
  computed: {
    carregarList() {
      const list = {}
      if (this.users) {
        this.users.forEach((user) => {
          console.log(user)
        })
      }
      return Object.keys(list)
    },
  },
  async created() {
    await this.list()
  },
  methods: {
    async list() {
      this.users = await this.$axios.$get('users')
    },
  },
}
</script>
