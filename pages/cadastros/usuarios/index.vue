<template>
  <div class="user">
    <breadcrumb active="Cadastro de usuários" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Usuários</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link to="/cadastros/usuarios/cadastrar" class="btn btn-primary">
              <b-icon-plus /> {{ 'Cadastrar' }}
            </n-link>
          </div>
        </div>
        <div class="info-content">
          <div class="text-right input-group">
            <input
              v-model="searchInput"
              type="search"
              :placeholder="'Buscar'"
              class="form-control search-input"
            />
          </div>
          <br />
          <no-item :list="users" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="users"
            :sort-by="'name'"
            :filter="debouncedSearch"
          >
            <template #cell(name)="data">
              {{ data.item.name }}
            </template>
            <template #cell(organization)="data">
              {{ data.item.organization.sigla }}
            </template>
            <template #cell(role)="data">
              {{ data.item.role }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="'/cadastros/usuarios/' + data.item._id + '/editar'"
                class="btn btn-secondary"
              >
                <b-icon-pencil />
              </n-link>
              <a class="btn btn-secondary" @click="remove(data.item._id)">
                <b-icon-trash />
              </a>
            </template>
          </b-table>
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
      searchInput: '',
      debouncedSearch: '',
      isFiltering: false,
      debounceTimer: null,
      table_fields: [
        {
          key: 'name',
          label: 'Nome',
          sortable: true,
        },
        {
          key: 'organization.sigla',
          label: 'Organização',
          sortable: true,
        },
        {
          key: 'role',
          label: 'Perfil',
          sortable: true,
        },
        {
          key: 'actions',
          label: 'Ação',
          class: 'actions',
        },
      ],
      users: null,
    }
  },

  watch: {
    searchInput(newVal) {
      this.isFiltering = true
      clearTimeout(this.debounceTimer)

      this.debounceTimer = setTimeout(() => {
        this.debouncedSearch = newVal
        this.isFiltering = false
      }, 300)
    },
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

  beforeDestroy() {
    clearTimeout(this.debounceTimer)
  },
}
</script>
