<template>
  <div class="ecological-data">
    <Breadcrumb active="Cadastro de Dados Ecológicos" />
    <div class="panel">
      <div class="panel-body">
        <div class="row panel-title">
          <div class="col-sm-6">
            <h1>Dados Ecológicos</h1>
          </div>
          <div class="col-sm-6 main-actions">
            <n-link
              to="/operacional/dados-ecologicos/cadastrar"
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
          <no-item :list="ecologicalData" />
          <b-table
            class="table b-table b-table-stacked-md table-striped"
            :fields="table_fields"
            :items="ecologicalData"
            :sort-by="'region'"
            :filter="filters.search"
            stacked="md"
          >
            <template #cell(region)="data">{{ data.item.region }} </template>
            <template #cell(harvestStartYear)="data">
              {{
                getMonthAndYear(
                  data.item.harvestStartMonth,
                  data.item.harvestStartYear
                )
              }}
            </template>
            <template #cell(harvestEndYear)="data">
              {{
                getMonthAndYear(
                  data.item.harvestEndMonth,
                  data.item.harvestEndYear
                )
              }}
            </template>
            <template #cell(peakBloomMonth)="data">
              {{ getMonthName(data.item.peakBloomMonth) }}
            </template>
            <template #cell(rainySeasonStartMonth)="data">
              {{ getMonthName(data.item.rainySeasonStartMonth) }}
            </template>
            <template #cell(nextHarvestExpectation)="data">
              {{ data.item.nextHarvestExpectation }}
            </template>
            <template #cell(actions)="data">
              <n-link
                :to="
                  '/operacional/dados-ecologicos/' + data.item._id + '/editar'
                "
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
import meses from '@/data/meses.json'

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      filters: { search: null },
      table_fields: [
        {
          key: 'region',
          label: 'Região',
          sortable: true,
        },
        {
          key: 'harvestStartYear',
          label: 'Início da Safra',
          sortable: true,
        },
        {
          key: 'harvestEndYear',
          label: 'Fim da Safra',
          sortable: true,
        },
        {
          key: 'peakBloomMonth',
          label: 'Pico da Floração',
          sortable: true,
        },
        {
          key: 'rainySeasonStartMonth',
          label: 'Início da Chuva Constante',
          sortable: true,
        },
        {
          key: 'nextHarvestExpectation',
          label: 'Expectativa para a Próxima Safra',
          sortable: true,
        },
        {
          key: 'actions',
          label: 'Ação',
          class: 'actions',
        },
      ],
      ecologicalData: [],
    }
  },

  async created() {
    await this.list()
  },
  methods: {
    async list() {
      try {
        const userId = this.currentUser.id
        this.ecologicalData = await this.$axios.$get(
          `/ecological-data/user/${userId}`
        )
      } catch (error) {
        console.error('Erro ao buscar os dados ecológicos:', error)
      }
    },
    remove(id) {
      this.$bvModal
        .msgBoxConfirm('Tem certeza que deseja excluír?')
        .then((confirmed) => {
          if (confirmed) {
            this.$axios
              .$delete('ecological-data/' + id)
              .then(() => {
                this.list()
              })
              .catch(this.showError)
          }
        })
    },

    getMonthName(monthNumber) {
      const mes = meses.find((mes) => mes.value === String(monthNumber))
      return mes ? mes.text : 'Mês desconhecido'
    },

    getMonthAndYear(month, year) {
      const monthName = this.getMonthName(month)
      return monthName ? `${monthName} de ${year}` : `Ano ${year}`
    },

    showError(error) {
      console.error('Erro ao carregar/excluir os dados ecológicos:', error)
    },
  },
}
</script>
