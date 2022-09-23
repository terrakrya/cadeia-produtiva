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
          <div class="text-right">
            <input
              v-model="filters.search"
              type="search"
              :placeholder="'Buscar'"
              class="form-control search-input"
            />
          </div>
          <br />
          <table
            class="table b-table b-table-stacked-md table-striped"
            :filter="filters.search"
          >
            <thead>
              <tr>
                <th>Nome</th>
                <th>Perfil</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user">
                <td>
                  <small>{{ user.name }}</small>
                </td>
                <td>
                  <small>{{ user.role }}</small>
                </td>
                <td>
                  <a class="btn btn-danger" @click="remove(user._id)">
                    <b-icon-trash />
                  </a>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
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
  components: {
    Breadcrumb,
  },
  data() {
    return {
      filters: { search: null },
      users: null,
    }
  },

  async created() {
    await this.list()
  },
  methods: {
    async list() {
      this.users = await this.$axios.$get('users', {
        params: {
          populate: 'network',
        },
      })
      console.log(this.users)
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('users/' + id)
              .then(() => {
                this.list()
              })
              .catch(this.showError)
          }
        })
    },
  },
}
</script>
