<template>
  <div class="type">
    <breadcrumb active="Cadastro de tipos" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Tipos de boas práticas e certificação</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link to="/cadastros/tipos/cadastrar" class="btn btn-primary">
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
          <no-item :list="types" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="types"
            :sort-by="'type'"
            :filter="filters.search"
          >
            <template #cell(type)="data">
              {{ data.item.type }}
            </template>
            <template #cell(name)="data">
              {{ data.item.name }}
            </template>
            <template #cell(code)="data">
              {{ data.item.code }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="'/cadastros/tipos/' + data.item._id + '/editar'"
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
      filters: { search: null },
      table_fields: [
        {
          key: 'type',
          label: 'Tipo',
          sortable: true,
        },
        {
          key: 'name',
          label: 'Nome',
          sortable: true,
        },
        {
          key: 'code',
          label: 'Código',
          sortable: true,
        },
        {
          key: 'actions',
          label: 'Ação',
          class: 'actions',
        },
      ],
      types: null,
    }
  },

  async created() {
    await this.list()
  },
  methods: {
    async list() {
      this.types = await this.$axios.$get('types')
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('types/' + id)
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
