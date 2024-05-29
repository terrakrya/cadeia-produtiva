<template>
  <div class="type">
    <div class="panel">
      <div class="panel-body">
        <div>
          <h4 class="form-title">Informar preço</h4>
          <h6 class="form-subtitle">Todos os campos são obrigatórios</h6>
        </div>
        <br />
        <loading :loading="is_loading" />
        <b-form @submit.prevent="save">
          <div v-if="isAdmin || isGlobalManager" class="row">
            <div class="col-sm-8">
              <b-form-group label="Organização">
                <b-form-select
                  v-model="form.organization"
                  class="form-control"
                  :options="organizationsOptions"
                />
              </b-form-group>
            </div>
          </div>
          <div v-if="isAdmin || isGlobalManager || isManager" class="row">
            <div class="col-sm-8">
              <b-form-group label="Mensageiro">
                <b-form-select
                  v-model="form.messenger"
                  class="form-control"
                  :options="messengers"
                  value-field="id"
                  text-field="name"
                  name="messenger"
                  @input="loadMessenger()"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6 mb-4">
              <b-form-select
                v-model="form.product"
                v-validate="'required'"
                class="form-control"
                :options="products"
                value-field="id"
                text-field="name"
                name="product"
              />
              <field-error :msg="veeErrors" field="product" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 title-buttons-form">
              <b-form-group label="Selecione a classificação de preço">
              </b-form-group>
            </div>
            <div
              class="col-md-8 d-flex justify-content-center align-items-center mb-4"
            >
              <div class="button-transaction">
                <b-button
                  variant="form"
                  @click="form.transaction = true"
                  :class="{ 'selected-button': form.transaction, 'mr-3': true }"
                  >Oferta de Preços
                </b-button>
                <b-button
                  variant="form"
                  @click="form.transaction = false"
                  :class="{ 'selected-button': !form.transaction }"
                  >Preço da Venda
                </b-button>
              </div>
            </div>
          </div>
          <div class="row">
            <div v-if="!form.transaction" class="col-sm-4">
              <b-form-group :label="`Preço por ${form.measure}`">
                <money
                  v-model="form.originalPrice"
                  :required="!form.transaction"
                  class="form-control"
                  name="originalPrice"
                ></money>
                <field-error :msg="veeErrors" field="originalPrice" />
              </b-form-group>
            </div>
            <div v-if="!form.transaction" class="col-sm-4">
              <b-form-group label="Quantidade Vendida">
                <b-form-input
                  v-model="form.transactedQuantity"
                  type="number"
                  :required="!form.transaction"
                  class="form-control"
                  name="transactedQuantity"
                  min="0"
                  step="1"
                  placeholder="0"
                ></b-form-input>
                <field-error :msg="veeErrors" field="transactedQuantity" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div v-if="form.transaction" class="col-sm-4">
              <b-form-group label="Informe o menor preço">
                <money
                  v-model="form.originalMinimumPrice"
                  :required="form.transaction"
                  class="form-control"
                  name="originalMinimumPrice"
                ></money>
                <field-error :msg="veeErrors" field="originalMinimumPrice" />
              </b-form-group>
            </div>
            <div v-if="form.transaction" class="col-sm-4">
              <b-form-group label="Informe o maior preço">
                <money
                  v-model="form.originalMaximumPrice"
                  :required="form.transaction"
                  class="form-control"
                ></money>
                <field-error :msg="veeErrors" field="originalMaximumPrice" />
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group label="Unidade de Medida da Venda">
                <b-form-select
                  v-model="form.measure"
                  v-validate="'required'"
                  class="form-control"
                  :options="medidas"
                />
              </b-form-group>
            </div>
            <div v-if="!form.transaction" class="col-sm-4">
              <b-form-group label="Valor Total da Transação">
                <money
                  :value="totalTransactionValue"
                  readonly
                  class="form-control"
                />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <b-col sm="6">
              <b-form-group label="Vendedor">
                <b-form-select
                  v-model="form.buyerPositionSeller"
                  v-validate="'required'"
                  class="form-control"
                  name="buyerPosition"
                  :options="buyerPositions"
                />
              </b-form-group>
            </b-col>
            <div class="col-sm-6">
              <b-form-group label="Comprador">
                <b-form-select
                  v-model="form.buyerPositionBuyer"
                  v-validate="'required'"
                  class="form-control"
                  :options="posicaoComprador"
                  nome="buyerPosition"
                />
                <field-error :msg="veeErrors" field="buyerPosition" />
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group :label="'Data'">
                <b-form-datepicker
                  v-model="form.createdAt"
                  v-validate="'required'"
                  class="date"
                  name="date_time"
                  locale="pt-BR"
                  :date-format-options="{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }"
                  placeholder="DD/MM/AAAA"
                />
              </b-form-group>
            </div>
            <b-col sm="4">
              <b-form-group label="Estado">
                <b-form-select
                  v-model="form.uf"
                  v-validate="'required'"
                  class="form-control"
                  :options="estados.map((e) => e.uf)"
                  name="uf"
                  @input="loadCities()"
                />
                <field-error :msg="veeErrors" field="uf" />
              </b-form-group>
            </b-col>
            <b-col sm="4">
              <b-form-group label="Município de Referência">
                <b-form-select
                  v-model="form.city"
                  class="form-control"
                  :options="cidades"
                  name="city"
                  @input="loadPracas()"
                />
                <field-error :msg="veeErrors" field="region" />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label="Região Castanheira">
                <input
                  v-model="form.region"
                  type="text"
                  readonly
                  class="form-control"
                  text-field="regiaoCastanheira"
                />
              </b-form-group>
            </div>
          </div>
          <form-submit :sending="is_sending" @input="transactedQuantity()" />
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
import Decimal from 'decimal.js'
import Breadcrumb from '@/components/Breadcrumb'
import posicaoComprador from '@/data/posicao-do-comprador.json'
import buyerPositions from '@/data/posicao-do-comprador'
import moeda from '@/data/moeda.json'
import medidas from '@/data/tipo-de-unidade.json'
import medidasPreco from '@/data/tipo-de-unidade.json'
import pais from '@/data/pais.json'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import pracas from '@/data/praca.json'
import transacao from '@/data/transacionada.json'
import regiao from '@/data/regioes-castanheiras.json'

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      regiao,
      pracas,
      buyerPositions,
      medidas,
      medidasPreco,
      moeda,
      posicaoComprador,
      pais,
      estados,
      cidades,
      transacao,
      form: {
        messenger: '',
        createdAt: this.$moment(new Date())
          .tz('America/Sao_Paulo')
          .format('YYYY-MM-DD'),
        buyerPositionBuyer: '',
        buyerPositionSeller: '',
        minimumPrice: 0,
        maximumPrice: 0,
        originalMinimumPrice: 0,
        originalMaximumPrice: 0,
        originalPrice: 0,
        currency: '',
        country: '',
        measure: '',
        product: '63ff4160ff65e9001b61c6af',
        uf: '',
        city: '',
        transaction: true,
        transactedQuantity: '',
        organization: '',
        square: '',
        squareid: '',
        region: '',
      },
      organizationsOptions: [],
      products: [],
      messengers: [],
      creating: true,
    }
  },
  computed: {
    totalTransactionValue() {
      return (this.form.transactedQuantity * this.form.originalPrice).toFixed(2)
    },
  },
  async created() {
    if (this.isEditing()) {
      await this.edit(this.$route.params.id)
    }

    if (!this.isMessenger) {
      await this.listOrganizations()
    }
    await this.loadOrganization()
    await this.preSetDados()
    await this.setMessenger()

    this.creating = false

    this.loadPracas()
    this.estados.sort(function (x, y) {
      return x.uf.localeCompare(y.uf)
    })
    this.form.transaction = this.form.transactedQuantity ? false : true
  },
  methods: {
    async listOrganizations() {
      try {
        const organizationsData = await this.$axios.$get('organizations')
        this.organizationsOptions = [
          { value: '', text: 'Selecione uma organização' },
        ].concat(
          organizationsData.map((organization) => ({
            value: organization._id,
            text: organization.name,
          }))
        )
      } catch (error) {
        console.error('Erro ao carregar organização:', error)
      }
    },
    setMessenger() {
      if (this.isAdmin || this.isGlobalManager || this.isManager) {
        this.form.messenger = this.currentUser._id
      }
    },
    preSetDados() {
      // pre-set das informações conforme o usuário logado
      if (!this.isEditing() && !this.isAdmin && !this.isGlobalManager) {
        this.form.currency = this.currentUser.currency
        this.form.country = this.currentUser.country
        this.form.measure = this.currentUser.unitOfMeasurement
        this.form.uf = this.currentUser.uf
        this.form.city = this.currentUser.city
        this.form.buyerPositionSeller = this.currentUser.buyerPosition
      }
    },
    async loadOrganization() {
      let organizationId = null
      if (this.isManager || this.isMessenger) {
        organizationId = this.currentUser.organization
      } else {
        organizationId = this.form.organization
      }

      const filters = { role: 'mensageiro' }

      if (organizationId) {
        const organization = await this.$axios.$get(
          'organizations/' + organizationId
        )
        this.products = organization.products
      }

      if (this.isMessenger) {
        filters.id = this.currentUser._id
      } else if (organizationId) {
        filters.organization = organizationId
      }

      this.messengers = await this.$axios.$get('users', {
        params: {
          filters,
        },
      })
    },
    async loadMessenger() {
      if (this.form.messenger && !this.creating) {
        const selectedMessenger = await this.$axios.$get(
          'users/' + this.form.messenger
        )

        // pre-set das informações conforme o usuário selecionado
        this.form.currency = selectedMessenger.currency
        this.form.country = selectedMessenger.country
        this.form.measure = selectedMessenger.unitOfMeasurement
        this.form.uf = selectedMessenger.uf
        this.form.city = selectedMessenger.city
        this.form.buyerPositionSeller = selectedMessenger.buyerPosition
      }
    },
    loadCities() {
      // lista de cidades com somente o item "selecione a cidade"
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]

      // filtra as cidades conforme a UF selecionada
      if (this.form.uf) {
        this.cidades = this.cidades.concat(Object(cidades)[this.form.uf])
      }

      // limpa a cidade digitada, caso não exista na lista
      if (this.form.city && this.cidades) {
        if (!this.cidades.find((c) => c === this.form.city)) {
          this.form.city = ''
        }
      }
    },
    // filtra as regiões imediatas conforme a município selecionada
    loadPracas() {
      if (this.form.city) {
        const cidade = this.form.city
        const regiao = this.regiao.filter(function (item) {
          return item.municipio === cidade
        })
        if (regiao && regiao.length > 0) {
          this.form.region = regiao[0].regiaoCastanheira
        }
        else {
          this.form.region = ''
        }
      }
    },
    transactedQuantity() {
      const multiplyer = this.getMultiplyer(this.form.measure)
      let min = this.form.originalMinimumPrice
      let max = this.form.originalMaximumPrice
      if (!this.form.transaction) {
        const finalValue = this.form.originalPrice * multiplyer
        this.form.originalMinimumPrice = finalValue
        this.form.originalMaximumPrice = finalValue
      } else {
        // +({numero}.toFixed(2)) arredonda o número com duas casas decimais e retorna um número (já que o toFloat converte em string)
        this.form.minimumPrice = +new Decimal(min).div(multiplyer).toFixed(2)
        this.form.maximumPrice = +new Decimal(max).div(multiplyer).toFixed(2)
      }
    },
    getMultiplyer(measure) {
      if (measure === 'Kg') {
        return 1
      } else if (measure === 'Tonelada') {
        return 1000
      } else if (measure === 'Lata') {
        return 12
      } else if (measure === 'Caixa') {
        return 24
      } else if (measure === 'Hectolitro') {
        return 60
      } else if (measure === 'Saca') {
        return 48
      } else if (measure === 'Barrica') {
        return 72
      }
    },
    async edit(id) {
      this.is_loading = true

      try {
        const dados = await this.$axios.$get('price-informations/' + id)

        this.form.organization = dados.organization
        this.form.messenger = dados.messenger
        this.form.transaction = dados.transaction
        this.form.originalMinimumPrice = dados.originalMinimumPrice || 0
        this.form.originalMaximumPrice = dados.originalMaximumPrice || 0
        this.form.transactedQuantity = dados.transactedQuantity || 0
        this.form.measure = dados.measure
        this.form.product = dados.product
        this.form.buyerPositionBuyer = dados.buyerPositionBuyer
        this.form.createdAt = dados.createdAt
        this.form.uf = dados.uf
        this.form.city = dados.city
        this.form.currency = dados.currency
        this.form.country = dados.country
        this.form.buyerPositionSeller = dados.buyerPositionSeller
        this.form.originalPrice = dados.originalPrice || 0
      } catch (e) {
        this.showError(e)
      }

      this.is_loading = false
    },
    save() {
      this.$validator.validate().then((isValid) => {
        // #region validação

        if (
          (!this.form.originalMinimumPrice ||
            this.form.originalMinimumPrice === 0) &&
          this.form.transaction
        ) {
          this.veeErrors.items.push({
            id: 101,
            vmId: this.veeErrors.vmId,
            field: 'originalMinimumPrice',
            msg: 'Este campo é obrigatório.',
            rule: 'required',
            scope: null,
          })
          isValid = false
        } else if (this.form.originalMaximumPrice === 0) {
          this.form.originalMaximumPrice = this.form.originalMinimumPrice
        } else if (
          this.form.originalMaximumPrice < this.form.originalMinimumPrice
        ) {
          this.veeErrors.items.push({
            id: 102,
            vmId: this.veeErrors.vmId,
            field: 'originalMaximumPrice',
            msg: 'O preço máximo deve ser maior ou igual ao preço mínimo.',
            rule: 'required',
            scope: null,
          })
          isValid = false
        } else if (this.form.transaction === false) {
          if (this.form.transactedQuantity === 0.0) {
            this.veeErrors.items.push({
              id: 103,
              vmId: this.veeErrors.vmId,
              field: 'transactedQuantity',
              msg: 'Este campo é obrigatório.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
        } 
        else if (!this.form.region) {
            this.veeErrors.items.push({
              id: 104,
              vmId: this.veeErrors.vmId,
              field: 'region',
              msg: 'O município selecionado não faz parte de uma Região Castanheira.',
              rule: 'required',
              scope: null,
            })
            isValid = false
        }else {
          this.veeErrors.items = this.veeErrors.items.filter(
            (error) => error.id !== 101 && error.id !== 102 && error.id !== 103 && error.id !== 104
          )
        }

        if (this.form.transaction === true) {
          this.form.transactedQuantity = 0
        }

        // #endregion validação

        if (isValid) {
          this.is_sending = true

          // #region ajusta os campos do form

          if (this.isAdmin || this.isGlobalManager) {
            this.form.organization = this.messengers.find(
              (messenger) => messenger._id === this.form.messenger
            ).organization._id
          } else {
            this.form.organization = this.currentUser.organization
          }

          if (this.form.transaction === true) {
            this.form.transactedQuantity = 0
          }

          if ((this.isManager && !this.form.messenger) || this.isMessenger) {
            this.form.messenger = this.currentUser._id
          }

          this.transactedQuantity()

          // #endregion ajusta os campos do form

          // #region envia os dados preenchidos ao server

          this.$axios({
            method: this.isEditing() ? 'PUT' : 'POST',
            url: this.isEditing()
              ? 'price-informations/' + this.$route.params.id
              : 'price-informations',
            data: this.form,
          })
            .then((resp) => {
              const category = resp.data
              if (category && category._id) {
                this.notify('informações de preço salvo com sucesso')
                this.$router.replace('/operacional/informacao-preco')
              }
              this.is_sending = false
            })
            .catch(this.showError)

          // #endregion envia os dados preenchidos ao server
        }
      })
    },
  },
}
</script>
