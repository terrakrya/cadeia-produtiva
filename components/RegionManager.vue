<template>
  <div>
    <h5>Regiões para esta Espécie</h5>
    <p class="text-muted small mb-3">
      <b-icon-info-circle />
      Gerencie as regiões onde esta espécie é encontrada. Cada região pode
      conter vários municípios.
    </p>

    <div class="text-right mb-3">
      <b-button variant="primary" @click="showAddModal">
        <b-icon-plus /> Adicionar Região
      </b-button>
    </div>

    <div v-if="regions.length > 0">
      <b-table
        :items="regions"
        :fields="fields"
        striped
        hover
        small
        :busy="isLoading"
        show-empty
        empty-text="Nenhuma região encontrada."
      >
        <template #cell(actions)="data">
          <b-button
            @click="showEditModal(data.item)"
            variant="secondary"
            size="sm"
          >
            <b-icon-pencil />
          </b-button>
          <b-button
            @click="confirmDelete(data.item)"
            variant="secondary"
            size="sm"
            class="ml-1"
          >
            <b-icon-trash />
          </b-button>
        </template>
      </b-table>
    </div>

    <div v-else class="text-center text-muted py-3">
      <p>Nenhuma região cadastrada para esta espécie.</p>
      <p class="small">Adicione regiões como: Alto Purus, Amapará, etc.</p>
    </div>

    <!-- Modal de Adicionar/Editar Região -->
    <b-modal v-model="isModalVisible" :title="modalTitle" size="lg" hide-footer>
      <b-form @submit.prevent="saveRegion">
        <b-form-group label="Nome da Região *">
          <b-form-input
            v-model="form.name"
            required
            placeholder="Ex: Alto Purus, Amapará..."
          />
        </b-form-group>

        <hr />
        <h6>Municípios</h6>

        <div
          v-for="(municipality, index) in form.municipalities"
          :key="index"
          class="border rounded p-3 mb-3"
        >
          <div class="row align-items-end">
            <div class="col-md-5">
              <b-form-group label="Estado (UF) *" class="mb-2">
                <b-form-select
                  v-model="municipality.uf"
                  :options="ufs"
                  value-field="uf"
                  text-field="uf"
                  required
                  @change="handleUfChange(municipality)"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled
                      >-- Selecione --</b-form-select-option
                    >
                  </template>
                </b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-5">
              <b-form-group label="Município *" class="mb-2">
                <b-form-select
                  v-model="municipality.name"
                  :options="getMunicipalitiesForUf(municipality.codigo_uf)"
                  value-field="nome"
                  text-field="nome"
                  :disabled="!municipality.uf"
                  required
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{
                        municipality.uf
                          ? '-- Selecione --'
                          : '-- Selecione o Estado primeiro --'
                      }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-button
                variant="danger"
                size="sm"
                @click="removeMunicipality(index)"
                :disabled="form.municipalities.length === 1"
              >
                <b-icon-trash />
              </b-button>
            </div>
          </div>
        </div>

        <div class="text-center mb-3">
          <b-button variant="outline-primary" @click="addMunicipality">
            <b-icon-plus /> Adicionar Município
          </b-button>
        </div>

        <hr />

        <div class="text-right">
          <b-button type="button" @click="hideModal">Cancelar</b-button>
          <b-button
            type="submit"
            variant="primary"
            class="ml-2"
            :disabled="isSaving"
          >
            <b-spinner v-if="isSaving" small class="mr-2" />
            {{ isEditing ? 'Atualizar' : 'Adicionar' }}
          </b-button>
        </div>
      </b-form>
    </b-modal>

    <!-- Modal de Confirmação de Exclusão -->
    <b-modal
      v-model="isDeleteModalVisible"
      title="Confirmar Exclusão"
      @ok="deleteRegion"
    >
      <p>
        Tem certeza que deseja excluir a região "{{ regionToDelete?.name }}"?
      </p>
      <p class="text-muted small">Esta ação afetará apenas esta espécie.</p>
    </b-modal>
  </div>
</template>

<script>
import ufs from '@/data/estados.json'
import allMunicipalities from '@/data/municipios.json'

export default {
  name: 'RegionManager',
  props: {
    specieId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      regions: [],
      isLoading: false,
      isSaving: false,
      isModalVisible: false,
      isDeleteModalVisible: false,
      isEditing: false,
      regionToDelete: null,
      form: this.getInitialForm(),
      fields: [
        { key: 'name', label: 'Nome' },
        { key: 'municipalities.length', label: 'Nº de Municípios' },
        { key: 'actions', label: 'Ações' },
      ],
      ufs,
      municipalitiesByUf: {},
    }
  },
  computed: {
    modalTitle() {
      return this.isEditing ? 'Editar Região' : 'Adicionar Nova Região'
    },
  },
  async created() {
    await this.fetchRegions()
  },
  methods: {
    capitalizeRegionName(name) {
      if (!name) return name

      return name
        .toLowerCase()
        .split(' ')
        .map((word) => {
          if (word.length > 2) {
            return word.charAt(0).toUpperCase() + word.slice(1)
          }
          return word
        })
        .join(' ')
    },
    getInitialForm() {
      return {
        _id: null,
        name: '',
        isActive: true,
        specie: this.specieId,
        municipalities: [{ name: '', state: '', uf: null, codigo_uf: null }],
      }
    },
    getMunicipalitiesForUf(codigo_uf) {
      if (!codigo_uf) return []
      // Cache para não filtrar a lista toda vez
      if (!this.municipalitiesByUf[codigo_uf]) {
        const filtered = allMunicipalities
          .filter((m) => m.codigo_uf === codigo_uf)
          .sort((a, b) => a.nome.localeCompare(b.nome)) // Ordena alfabeticamente
        this.$set(this.municipalitiesByUf, codigo_uf, filtered)
      }
      return this.municipalitiesByUf[codigo_uf]
    },
    handleUfChange(municipality) {
      const selectedUf = this.ufs.find((u) => u.uf === municipality.uf)
      if (selectedUf) {
        municipality.state = selectedUf.nome
        municipality.codigo_uf = selectedUf.codigo_uf
        municipality.name = null // Reseta a seleção do município
      }
    },
    async fetchRegions() {
      this.isLoading = true
      try {
        const timestamp = new Date().getTime()
        const response = await this.$axios.get(
          `/regions?specie=${this.specieId}&_t=${timestamp}`
        )
        this.regions = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      } catch (error) {
        console.error('Error fetching regions:', error)
      } finally {
        this.isLoading = false
      }
    },
    showAddModal() {
      this.isEditing = false
      this.form = this.getInitialForm()
      this.isModalVisible = true
    },
    showEditModal(region) {
      this.isEditing = true
      this.form = JSON.parse(JSON.stringify(region))

      if (!this.form.municipalities || this.form.municipalities.length === 0) {
        this.form.municipalities = [
          { name: '', state: '', uf: null, codigo_uf: null },
        ]
      } else {
        this.form.municipalities.forEach((municipality) => {
          if (municipality.uf && !municipality.codigo_uf) {
            const selectedUf = this.ufs.find((u) => u.uf === municipality.uf)
            if (selectedUf) {
              municipality.codigo_uf = selectedUf.codigo_uf
            }
          }
        })
      }

      this.isModalVisible = true
    },
    hideModal() {
      this.isModalVisible = false
    },
    addMunicipality() {
      this.form.municipalities.push({
        name: '',
        state: '',
        uf: null,
        codigo_uf: null,
      })
    },
    removeMunicipality(index) {
      this.form.municipalities.splice(index, 1)
    },
    async saveRegion() {
      // Validação para municípios duplicados
      const municipalityKeys = this.form.municipalities
        .map((m) => `${m.name}-${m.uf}`)
        .filter((key) => key !== '-')
      const uniqueKeys = new Set(municipalityKeys)

      if (municipalityKeys.length !== uniqueKeys.size) {
        this.notify(
          'Não é possível adicionar o mesmo município mais de uma vez na região.',
          'error'
        )
        return
      }

      // Validação para municípios vazios
      const hasEmptyMunicipality = this.form.municipalities.some(
        (m) => !m.name || !m.uf
      )
      if (hasEmptyMunicipality) {
        this.notify('Todos os municípios devem ser preenchidos.', 'error')
        return
      }

      this.isSaving = true

      const formData = { ...this.form }
      formData.name = this.capitalizeRegionName(formData.name)

      const method = this.isEditing ? 'put' : 'post'
      const url = this.isEditing ? `/regions/${this.form._id}` : '/regions'

      try {
        await this.$axios({ method, url, data: formData })
        this.notify(
          `Região ${this.isEditing ? 'atualizada' : 'salva'} com sucesso!`
        )
        await this.fetchRegions()
        this.hideModal()
      } catch (error) {
        if (error.response && error.response.data) {
          this.notify(error.response.data, 'error')
        } else {
          this.notify('Erro ao salvar a região: ' + error.message, 'error')
        }
      } finally {
        this.isSaving = false
      }
    },
    confirmDelete(region) {
      this.regionToDelete = region
      this.isDeleteModalVisible = true
    },
    async deleteRegion() {
      try {
        await this.$axios.delete(`/regions/${this.regionToDelete._id}`)
        this.notify('Região excluída com sucesso!')
        await this.fetchRegions()
        this.isDeleteModalVisible = false
        this.regionToDelete = null
      } catch (error) {
        if (error.response && error.response.data) {
          this.notify(error.response.data, 'error')
        } else {
          this.notify('Erro ao excluir a região: ' + error.message, 'error')
        }
      }
    },
  },
  watch: {
    specieId: {
      immediate: true,
      handler(newSpecieId) {
        if (newSpecieId) {
          this.form.specie = newSpecieId
          this.fetchRegions()
        }
      },
    },
  },
}
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>
