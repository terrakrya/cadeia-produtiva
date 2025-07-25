<template>
  <div class="ecological-data">
    <div class="panel">
      <div class="panel-body">
        <div>
          <h4 class="form-title">Informar Dados Ecológicos</h4>
          <h6 class="form-subtitle">
            Informe os Dados Ecológicos da sua Região
          </h6>
        </div>
        <br />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div class="row">
            <div class="col-sm-6 mb-2">
              <b-form-group label="Início da Safra">
                <b-input-group>
                  <b-form-select
                    v-model="form.harvestStartYear"
                    :options="availableYears"
                    class="form-control"
                    name="harvestStartYear"
                    v-validate="'required'"
                    @change="validateEndYear"
                  >
                    <option :value="''" disabled selected hidden>Ano</option>
                  </b-form-select>
                  <b-form-select
                    v-model="form.harvestStartMonth"
                    :options="meses"
                    class="form-control"
                    name="harvestStartMonth"
                    v-validate="'required'"
                  >
                    <option :value="''" disabled selected hidden>Mês</option>
                  </b-form-select>
                </b-input-group>
                <field-error :msg="veeErrors" field="harvestStartYear" />
                <field-error :msg="veeErrors" field="harvestStartMonth" />
              </b-form-group>
            </div>

            <div class="col-sm-6 mb-2">
              <b-form-group label="Fim da Safra">
                <b-input-group>
                  <b-form-select
                    v-model="form.harvestEndYear"
                    :options="availableYears"
                    class="form-control"
                    name="harvestEndYear"
                    v-validate="'required'"
                    @change="validateEndYear"
                  >
                    <option :value="''" disabled selected hidden>Ano</option>
                  </b-form-select>
                  <b-form-select
                    v-model="form.harvestEndMonth"
                    :options="meses"
                    class="form-control"
                    name="harvestEndMonth"
                    v-validate="'required'"
                  >
                    <option :value="''" disabled selected hidden>Mês</option>
                  </b-form-select>
                </b-input-group>
                <field-error :msg="veeErrors" field="harvestEndYear" />
                <field-error :msg="veeErrors" field="harvestEndMonth" />
              </b-form-group>
            </div>
          </div>

          <div v-if="yearError" class="text-danger">
            A data de fim não pode ser anterior à data de início.
          </div>

          <div class="row">
            <div class="col-md-4 title-buttons-form">
              <b-form-group
                label="Previsão de Produção da Natureza"
              ></b-form-group>
            </div>
            <div
              class="col-md-8 d-flex justify-content-center align-items-center mb-4"
            >
              <div class="button-transaction">
                <b-button
                  variant="ecological-form"
                  @click="form.nextHarvestExpectation = 'Grande'"
                  :class="{
                    'selected-button': form.nextHarvestExpectation === 'Grande',
                    'mr-3': true,
                  }"
                >
                  Grande
                </b-button>
                <b-button
                  variant="ecological-form"
                  @click="form.nextHarvestExpectation = 'Média'"
                  :class="{
                    'selected-button': form.nextHarvestExpectation === 'Média',
                    'mr-3': true,
                  }"
                >
                  Média
                </b-button>
                <b-button
                  variant="ecological-form"
                  @click="form.nextHarvestExpectation = 'Pequena'"
                  :class="{
                    'selected-button':
                      form.nextHarvestExpectation === 'Pequena',
                  }"
                >
                  Pequena
                </b-button>
              </div>
            </div>
          </div>
          <div
            v-if="!form.nextHarvestExpectation && showHarvestError"
            class="text-danger"
          >
            Por favor, selecione uma expectativa para a próxima safra.
          </div>

          <div class="row">
            <div class="col-sm-6 mb-2">
              <b-form-group label="Mês de Início da Chuva Constante">
                <b-form-select
                  v-model="form.rainySeasonStartMonth"
                  :options="meses"
                  class="form-control"
                  v-validate="'required'"
                >
                  <option :value="''" disabled selected hidden>
                    Selecione o Mês
                  </option>
                </b-form-select>
                <field-error :msg="veeErrors" field="rainySeasonStartMonth" />
              </b-form-group>
            </div>
            <div class="col-sm-6 mb-2">
              <b-form-group label="Mês de Pico da Floração">
                <b-form-select
                  v-model="form.peakBloomMonth"
                  :options="meses"
                  class="form-control"
                  v-validate="'required'"
                >
                  <option :value="''" disabled selected hidden>
                    Selecione o Mês
                  </option>
                </b-form-select>
                <field-error :msg="veeErrors" field="peakBloomMonth" />
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
import localforage from 'localforage'

export default {
  data() {
    const currentYear = new Date().getFullYear()
    return {
      meses,
      form: {
        harvestStartYear: currentYear - 1,
        harvestStartMonth: '',
        harvestEndYear: currentYear,
        harvestEndMonth: '',
        peakBloomMonth: '',
        rainySeasonStartMonth: '',
        nextHarvestExpectation: 'Média',
      },
      availableYears: Array.from({ length: 9 }, (v, i) => ({
        value: currentYear - 7 + i,
        text: currentYear - 7 + i,
      })),
      yearError: false,
      showHarvestError: false,
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
    validateEndYear() {
      const startYear = this.form.harvestStartYear
      const startMonth = this.form.harvestStartMonth
      const endYear = this.form.harvestEndYear
      const endMonth = this.form.harvestEndMonth

      // Verifica se o ano de fim é menor que o ano de início
      if (endYear < startYear) {
        this.yearError = true
      }
      // Verifica se o ano é o mesmo, mas o mês de fim é antes do mês de início
      else if (endYear === startYear && endMonth < startMonth) {
        this.yearError = true
      } else {
        this.yearError = false
      }
    },
    async edit(id) {
      this.is_loading = true
      try {
        const dados = await this.$axios.$get(`ecological-data/${id}`)
        this.form = {
          harvestStartYear: dados.harvestStartYear || currentYear - 1,
          harvestStartMonth: dados.harvestStartMonth || '',
          harvestEndYear: dados.harvestEndYear || currentYear,
          harvestEndMonth: dados.harvestEndMonth || '',
          peakBloomMonth: dados.peakBloomMonth || '',
          rainySeasonStartMonth: dados.rainySeasonStartMonth || '',
          nextHarvestExpectation: dados.nextHarvestExpectation || '',
        }
      } catch (error) {
        console.error('Erro ao carregar os dados ecológicos:', error)
      }
      this.is_loading = false
    },
    async save() {
      this.validateEndYear()

      this.$validator.validate().then(async (isValid) => {
        if (this.yearError || this.showHarvestError) {
          isValid = false
        }

        if (isValid) {
          this.is_sending = true
          const payload = {
            ...this.form,
            region: this.$auth.user.region,
            regionId: this.$auth.user.regionId,
          }
          
          if (navigator.onLine) {
            // Online: send data to server
            try {
              await this.$axios.post('ecological-data', payload)
              this.notify('Dados ecológicos salvos com sucesso')
              await this.$router.replace('/painel')
              this.is_sending = false
            } catch (error) {
              console.error('Erro ao salvar os dados ecológicos:', error)
              this.showError(error)
              this.is_sending = false
            }
          } else {
            // Offline: store data locally
            const pendingEcologicalData = 
              (await localforage.getItem('pendingEcologicalData')) || []
            pendingEcologicalData.push({
              method,
              url,
              data: ecologicalData
            })
            await localforage.setItem('pendingEcologicalData', pendingEcologicalData)
            this.notify(
              'Você está offline. Os dados ecológicos serão enviados quando a conexão for restabelecida.'
            )
            this.is_sending = false
            try {
              await this.$router.replace('/painel')
            } catch (error) {}
          }
        }
      })
    },
  },
}
</script>
