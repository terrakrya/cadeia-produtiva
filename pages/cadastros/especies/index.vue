<template>
  <div class="species">
    <Breadcrumb active="Cadastro de espécies" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Espécies</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link to="/cadastros/especies/cadastrar" class="btn btn-primary">
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
          <no-item :list="species" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="species"
            :sort-by="'code'"
            :filter="filters.search"
          >
            <template #cell(popularName)="data">
              {{ data.item.popularName }}
            </template>
            <template #cell(code)="data">
              {{ data.item.code }}
            </template>
            <template #cell(description)="data">
              {{ data.item.description }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="'/cadastros/especies/' + data.item._id + '/editar'"
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
          key: 'popularName',
          label: 'Nome popular',
          sortable: true,
        },
        {
          key: 'code',
          label: 'Código',
          sortable: true,
        },
        {
          key: 'description',
          label: 'Descrição',
          sortable: true,
        },
        {
          key: 'actions',
          label: 'Ação',
          class: 'actions',
        },
      ],
      species: null,
    }
  },

  async created() {
    await this.list()
  },
  methods: {
    async list() {
      this.species = await this.$axios.$get('species')
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('species/' + id)
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
