<template>
  <div class="ecological-data">
    <div class="panel">
      <div class="panel-body">
        <div>
          <h4 class="form-title">Informar Dados Ecológicos</h4>
          <h6 class="form-subtitle">Todos os campos são obrigatórios</h6>
        </div>
        <br />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-6 mb-2">
              <b-form-group label="Mês de Pico da Floração">
                <b-form-select
                  v-model="form.peakBloomMonth"
                  :options="meses"
                  class="form-control"
                  name="peakBloomMonth"
                  v-validate="'required'"
                >
                  <option :value="''" disabled selected hidden>
                    Mês de Pico da Floração
                  </option>
                </b-form-select>
                <field-error :msg="veeErrors" field="peakBloomMonth" />
              </b-form-group>
            </div>
            <div class="col-sm-6 mb-2">
              <b-form-group label="Mês de Início da Chuva Constante">
                <b-form-select
                  v-model="form.rainySeasonStartMonth"
                  :options="meses"
                  class="form-control"
                  name="rainySeasonStartMonth"
                  v-validate="'required'"
                >
                  <option :value="''" disabled selected hidden>
                    Mês de Início da Chuva Constante
                  </option>
                </b-form-select>
                <field-error :msg="veeErrors" field="rainySeasonStartMonth" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 title-buttons-form">
              <b-form-group
                label="Expectativa para a Próxima Safra"
              ></b-form-group>
            </div>
            <div
              class="col-md-8 d-flex justify-content-center align-items-center mb-4"
            >
              <div class="button-transaction">
                <b-button
                  variant="ecological-form"
                  @click="form.nextHarvestExpectation = 'Melhor'"
                  :class="{
                    'selected-button': form.nextHarvestExpectation === 'Melhor',
                    'mr-3': true,
                  }"
                >
                  Melhor
                </b-button>
                <b-button
                  variant="ecological-form"
                  @click="form.nextHarvestExpectation = 'Igual'"
                  :class="{
                    'selected-button': form.nextHarvestExpectation === 'Igual',
                    'mr-3': true,
                  }"
                >
                  Igual
                </b-button>
                <b-button
                  variant="ecological-form"
                  @click="form.nextHarvestExpectation = 'Pior'"
                  :class="{
                    'selected-button': form.nextHarvestExpectation === 'Pior',
                  }"
                >
                  Pior
                </b-button>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6 mb-2">
              <b-form-group label="Mês de Início da Safra">
                <b-form-select
                  v-model="form.harvestStartMonth"
                  :options="meses"
                  class="form-control"
                  name="harvestStartMonth"
                  v-validate="'required'"
                >
                  <option :value="''" disabled selected hidden>
                    Mês de Início da Safra
                  </option>
                </b-form-select>
                <field-error :msg="veeErrors" field="harvestStartMonth" />
              </b-form-group>
            </div>
            <div class="col-sm-6 mb-2">
              <b-form-group label="Mês de Fim da Safra">
                <b-form-select
                  v-model="form.harvestEndMonth"
                  :options="meses"
                  class="form-control"
                  name="harvestEndMonth"
                  v-validate="'required'"
                >
                  <option :value="''" disabled selected hidden>
                    Mês de Fim da Safra
                  </option>
                </b-form-select>
                <field-error :msg="veeErrors" field="harvestEndMonth" />
              </b-form-group>
            </div>
          </div>
          <form-submit :sending="is_sending" />
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
import meses from '@/data/meses.json'

export default {
  data() {
    return {
      meses,
      form: {
        peakBloomMonth: '',
        rainySeasonStartMonth: '',
        nextHarvestExpectation: 'Igual',
        harvestStartMonth: '',
        harvestEndMonth: '',
      },
      is_loading: false,
      is_sending: false,
    }
  },
  async created() {
    if (this.isEditing()) {
      await this.edit(this.$route.params.id)
    }
  },
  methods: {
    async edit(id) {
      this.is_loading = true
      try {
        const dados = await this.$axios.$get(`ecological-data/${id}`)
        this.form = {
          peakBloomMonth: dados.peakBloomMonth || '',
          rainySeasonStartMonth: dados.rainySeasonStartMonth || '',
          nextHarvestExpectation: dados.nextHarvestExpectation || '',
          harvestStartMonth: dados.harvestStartMonth || '',
          harvestEndMonth: dados.harvestEndMonth || '',
        }
      } catch (error) {
        console.error('Erro ao carregar os dados ecológicos:', error)
      }
      this.is_loading = false
    },
    async save() {
      this.$validator.validate().then((isValid) => {
        if (isValid) {
          this.is_sending = true
          const method = this.isEditing() ? 'PUT' : 'POST'
          const url = this.isEditing()
            ? `ecological-data/${this.$route.params.id}`
            : 'ecological-data'
          this.$axios({
            method,
            url,
            data: this.form,
          })
            .then(() => {
              this.$router.replace('/painel')
              this.is_sending = false
            })
            .catch((error) => {
              console.error('Erro ao salvar os dados ecológicos:', error)
              this.is_sending = false
            })
        }
      })
    },
  },
}
</script>
