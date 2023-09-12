<template>
  <div class="organization">
    <breadcrumb active="Cadastro de organizações" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Organizações</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link
              to="/cadastros/organizacoes/cadastrar"
              class="btn btn-primary"
            >
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
          <no-item :list="organizations" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="organizations"
            :sort-by="'name'"
            :filter="filters.search"
          >
            <template #cell(name)="data">
              {{ data.item.name }}
            </template>
            <template #cell(type)="data">
              {{ data.item.type }}
            </template>
            <template #cell(sigla)="data">
              {{ data.item.sigla }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="'/cadastros/organizacoes/' + data.item._id + '/editar'"
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
import { isManager } from '~/api/config/auth'
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
          key: 'type',
          label: 'Tipo',
          sortable: true,
        },
        {
          key: 'sigla',
          label: 'Sigla',
          sortable: true,
        },
      ],
      organizations: [],
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
      this.organizations = await this.$axios.$get('organizations')
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('organizations/' + id)
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
