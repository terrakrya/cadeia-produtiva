<template>
  <div class="product">
    <breadcrumb active="Cadastro de Áreas geográficas" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Áreas geográficas</h1>
          </div>
          <div v-if="!isManager" class="col-sm-6 main-actions">
            <n-link to="/cadastros/areas-geograficas/cadastrar" class="btn btn-primary">
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
          <no-item :list="geographic" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="geographic"
            :sort-by="'code'"
            :filter="filters.search"
          >
            <template #cell(uf)="data">
              {{ data.item.uf }}
            </template>
            <template #cell(county)="data">
              {{ data.item.county }}
            </template>
            <template #cell(square)="data">
              {{ data.item.square }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="'/cadastros/areas-geograficas/' + data.item._id + '/editar'"
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
          key: 'uf',
          label: 'Estado',
          sortable: true,
        },
        {
          key: 'county',
          label: 'Municipio',
          sortable: true,
        },
        {
          key: 'square',
          label: 'Praça',
          sortable: true,
        },
      ],
      geographic: null,
    }
  },

  async created() {
    await this.list()
    const actions = {
          key: 'actions',
          label: 'Ação',
          class: 'actions',
        }
     if (!this.isManager) {
      this.table_fields.push(actions)
     }
  },
  methods: {
    async list() {
      this.geographic = await this.$axios.$get('geographic-areas')
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('geographic-areas/' + id)
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
