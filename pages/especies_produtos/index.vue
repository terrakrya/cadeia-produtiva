<template>
  <div class="SpeciesProduct">
    <breadcrumb active="Cadastro de Classificação da Espécie/Produto" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Espécie/Produto</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link to="/especies_produtos/cadastrar" class="btn btn-primary">
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
          <no-item :list="speciesProducts" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="speciesProducts"
            :sort-by="'name'"
            :filter="filters.search"
          >
            <template #cell(name)="data">
              {{ data.item.name }}
            </template>
            <template #cell(species)="data">
              {{ data.item.species }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="'/especies_produtos/' + data.item._id + '/editar'"
                class="btn btn-secondary"
              >
                <b-icon-pencil />
              </n-link>
              <a class="btn btn-danger" @click="remove(data.item._id)">
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
          key: 'name',
          label: 'Nome',
          sortable: true,
        },
        {
          key: 'species',
          label: 'Espécies',
          sortable: true,
        },
        {
          key: 'actions',
          label: 'Ação',
          class: 'actions',
        },
      ],
      speciesProducts: null,
    }
  },

  async created() {
    await this.list()
  },
  methods: {
    async list() {
      this.speciesProducts = await this.$axios.$get('speciesProducts')
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('speciesProducts/' + id)
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
