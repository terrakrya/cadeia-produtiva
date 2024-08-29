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
                />
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
                />
                <field-error :msg="veeErrors" field="rainySeasonStartMonth" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12 mb-2">
              <b-form-group label="Expectativa para a Próxima Safra">
                <b-form-input
                  v-model="form.nextHarvestExpectation"
                  class="form-control"
                  name="nextHarvestExpectation"
                  v-validate="'required'"
                  placeholder="Melhor que a anterior, Pior que a anterior, etc."
                />
                <field-error :msg="veeErrors" field="nextHarvestExpectation" />
              </b-form-group>
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
                />
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
                />
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
        nextHarvestExpectation: '',
        harvestStartMonth: '',
        harvestEndMonth: '',
      },
      is_loading: false,
      is_sending: false,
    }
  },
  methods: {
    save() {
      this.$validator.validate().then((isValid) => {
        if (isValid) {
          this.is_sending = true
          this.$axios
            .post('ecological-data', this.form)
            .then(() => {
              this.$router.replace('/painel') // Redirecione após o sucesso
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
