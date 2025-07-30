<template>
  <div>
    <h5>Unidades de Medida para esta Espécie</h5>
    <p class="text-muted small mb-3">
      <b-icon-info-circle />
      Você pode usar exatamente os mesmos nomes e valores que outras espécies.
      Cada espécie é independente.
    </p>

    <b-form data-vv-scope="measurement" @submit.prevent="save">
      <div class="row">
        <div class="col-md-5">
          <b-form-group label="Nome da Unidade">
            <b-form-input
              v-model="form.name"
              v-validate="'required'"
              name="name"
              placeholder="Ex: Lata, Saca, Caixa..."
            />
            <field-error :msg="veeErrors" field="name" />
          </b-form-group>
        </div>
        <div class="col-md-5">
          <b-form-group label="Referência em Kg">
            <b-form-input
              type="number"
              step="0.01"
              min="0.01"
              v-model="form.referenceInKg"
              v-validate="'required|min_value:0.01'"
              name="referenceInKg"
              placeholder="Ex: 12.00"
            />
            <field-error :msg="veeErrors" field="referenceInKg" />
          </b-form-group>
        </div>
        <div class="col-md-2">
          <b-form-group label="Adicionar">
            <b-button
              type="submit"
              variant="primary"
              block
              :disabled="isSaving"
            >
              <b-spinner v-if="isSaving" small class="mr-2" />
              {{ form._id ? 'Atualizar' : 'Adicionar' }}
            </b-button>
          </b-form-group>
        </div>
      </div>
    </b-form>

    <div v-if="measurements.length > 0">
      <b-table :items="measurements" :fields="fields" striped hover small>
        <template #cell(actions)="data">
          <b-button
            @click="editMeasurement(data.item)"
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
      <p>Nenhuma unidade de medida cadastrada para esta espécie.</p>
      <p class="small">
        Adicione unidades como: Lata (12 kg), Saca (48 kg), Caixa (24 kg), etc.
      </p>
    </div>

    <b-modal
      v-model="isDeleteModalVisible"
      title="Confirmar Exclusão"
      @ok="deleteMeasurement"
    >
      <p>
        Tem certeza que deseja excluir a unidade de medida "{{
          measurementToDelete?.name
        }}"?
      </p>
      <p class="text-muted small">Esta ação afetará apenas esta espécie.</p>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'MeasurementForm',
  props: {
    specieId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      form: {
        name: '',
        referenceInKg: null,
        specie: this.specieId,
      },
      measurements: [],
      fields: [
        { key: 'name', label: 'Nome' },
        { key: 'referenceInKg', label: 'Referência em Kg' },
        { key: 'actions', label: 'Ações' },
      ],
      isDeleteModalVisible: false,
      measurementToDelete: null,
      isSaving: false,
    }
  },
  async created() {
    await this.fetchMeasurements()
  },
  methods: {
    async fetchMeasurements() {
      try {
        if (this.specieId) {
          this.measurements = await this.$axios.$get(
            `measurements/species/${this.specieId}`
          )
          this.measurements = this.measurements.sort(
            (a, b) => a.referenceInKg - b.referenceInKg
          )
          this.$emit('measurements-updated', this.measurements)
          
          // Force re-render to ensure UI updates
          this.$forceUpdate()
        }
      } catch (error) {
        console.error('Error fetching measurements:', error)
      }
    },
    async save() {
      // Validate only the measurement form scope
      const isValid = await this.$validator.validateAll('measurement')

      if (!isValid) {
        return
      }

      this.isSaving = true

      try {
        this.form.specie = this.specieId

        if (this.form._id) {
          await this.$axios.$put(`measurements/${this.form._id}`, this.form)
        } else {
          await this.$axios.$post('measurements', this.form)
        }

        await this.fetchMeasurements()
        this.resetForm()
      } catch (error) {
        if (error.response && error.response.data) {
          // Handle duplicate name error
          if (error.response.data.includes('Já existe uma unidade de medida')) {
            this.veeErrors.items.push({
              id: 201,
              vmId: this.veeErrors.vmId,
              field: 'name',
              msg: error.response.data,
              rule: 'unique',
              scope: 'measurement',
            })
          } else {
            // Handle other errors with notification
            this.notify(error.response.data, 'error')
          }
        } else {
          this.notify(
            'Erro ao salvar unidade de medida: ' + error.message,
            'error'
          )
        }
      } finally {
        this.isSaving = false
      }
    },
    editMeasurement(measurement) {
      // Clear previous measurement errors
      this.$validator.errors.clear('measurement')
      this.form = { ...measurement }
    },
    resetForm() {
      // Clear previous measurement errors
      this.$validator.errors.clear('measurement')
      this.form = {
        name: '',
        referenceInKg: null,
        specie: this.specieId,
      }
    },
    confirmDelete(measurement) {
      this.measurementToDelete = measurement
      this.isDeleteModalVisible = true
    },
    async deleteMeasurement() {
      try {
        await this.$axios.$delete(
          `measurements/${this.measurementToDelete._id}`
        )
        await this.fetchMeasurements()
        this.isDeleteModalVisible = false
        this.measurementToDelete = null
      } catch (error) {
        this.showError(error)
      }
    },
  },
  watch: {
    specieId: {
      immediate: true,
      handler(newSpecieId) {
        if (newSpecieId) {
          this.form.specie = newSpecieId
          this.fetchMeasurements()
        }
      },
    },
  },
}
</script>

<style scoped>
.measurement-form {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1.5rem;
  margin-top: 1rem;
  background-color: #f8f9fa;
}
</style>
