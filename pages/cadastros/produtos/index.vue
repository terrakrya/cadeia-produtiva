<template>
  <div class="product">
    <breadcrumb active="Cadastro de produtos" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Produtos</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link to="/cadastros/produtos/cadastrar" class="btn btn-primary">
              <b-icon-plus /> {{ 'Cadastrar' }}
            </n-link>
          </div>
        </div>
        <div class="info-content">
          <div class="text-right">
            <input
              v-model="searchInput"
              type="search"
              :placeholder="'Buscar'"
              class="form-control search-input"
            />
          </div>
          <br />
          <no-item :list="products" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="products"
            :sort-by="'name'"
            :filter="debouncedSearch"
          >
            <template #cell(name)="data">
              {{ data.item.name }}
            </template>
            <template #cell(description)="data">
              {{ data.item.description }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="'/cadastros/produtos/' + data.item._id + '/editar'"
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
      debounceTimer: null,
      table_fields: [
        {
          key: 'name',
          label: 'Nome',
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
      products: null,
    }
  },

  watch: {
    searchInput(newVal) {
      clearTimeout(this.debounceTimer)

      this.debounceTimer = setTimeout(() => {
        this.debouncedSearch = newVal
      }, 300)
    },
  },

  async created() {
    await this.list()
  },

  methods: {
    async list() {
      this.products = await this.$axios.$get('products/cadastro-de-produtos')
    },

    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('products/' + id)
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
