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
            <div class="col-sm-4">
              <b-form-group label="Produto">
                <input
                  v-model="productName"
                  type="text"
                  readonly
                  class="form-control"
                />
              </b-form-group>
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
                  @click="form.transaction = 'oferta de preços'"
                  :class="{
                    'selected-button': form.transaction === 'oferta de preços',
                    'mr-3': true,
                  }"
                  >Oferta de Preços
                </b-button>
                <b-button
                  variant="form"
                  @click="form.transaction = 'preço da venda'"
                  :class="{
                    'selected-button': form.transaction === 'preço da venda',
                  }"
                  >Preço da Venda
                </b-button>
              </div>
            </div>
          </div>
          <div class="row">
            <div v-if="form.transaction === 'preço da venda'" class="col-sm-4">
              <b-form-group :label="`Preço por ${form.measure}`">
                <money
                  v-model="form.originalPrice"
                  :required="!form.transaction"
                  class="form-control"
                  name="originalPrice"
                  :precision="form.measure === 'Kg' ? 2 : 0"
                ></money>
                <field-error :msg="veeErrors" field="originalPrice" />
              </b-form-group>
            </div>
            <div v-if="form.transaction === 'preço da venda'" class="col-sm-4">
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
            <div
              v-if="form.transaction === 'oferta de preços'"
              class="col-sm-4"
            >
              <b-form-group label="Informe o menor preço">
                <money
                  v-model="form.originalMinimumPrice"
                  :required="form.transaction"
                  class="form-control"
                  name="originalMinimumPrice"
                  :precision="form.measure === 'Kg' ? 2 : 0"
                ></money>
                <field-error :msg="veeErrors" field="originalMinimumPrice" />
              </b-form-group>
            </div>
            <div
              v-if="form.transaction === 'oferta de preços'"
              class="col-sm-4"
            >
              <b-form-group label="Informe o maior preço">
                <money
                  v-model="form.originalMaximumPrice"
                  :required="form.transaction"
                  class="form-control"
                  name="originalMaximumPrice"
                  :precision="form.measure === 'Kg' ? 2 : 0"
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
                  :options="medidasOptions"
                  :disabled="loadingMedidas"
                  @input="onMeasureChange"
                />
                <small v-if="loadingMedidas" class="text-muted">
                  <i class="fa fa-spinner fa-spin"></i> Carregando medidas
                  disponíveis...
                </small>
              </b-form-group>
            </div>
            <div v-if="form.transaction === 'preço da venda'" class="col-sm-4">
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
                <b-input-group>
                  <b-form-select
                    v-model="form.day"
                    :options="availableDays"
                    class="form-control"
                    name="day"
                    v-validate="'required'"
                  >
                    <option :value="''" disabled selected hidden>Dia</option>
                  </b-form-select>
                  <b-form-select
                    v-model="form.month"
                    :options="meses"
                    class="form-control"
                    name="month"
                    v-validate="'required'"
                    style="width: 35%"
                  >
                    <option :value="''" disabled selected hidden>Mês</option>
                  </b-form-select>
                  <b-form-select
                    v-model="form.year"
                    :options="availableYears"
                    class="form-control"
                    name="year"
                    v-validate="'required'"
                  >
                    <option :value="''" disabled selected hidden>Ano</option>
                  </b-form-select>
                </b-input-group>
                <field-error :msg="veeErrors" field="day" />
                <field-error :msg="veeErrors" field="month" />
                <field-error :msg="veeErrors" field="year" />
              </b-form-group>
            </div>
            <b-col sm="4">
              <b-form-group label="Estado">
                <b-form-select
                  v-model="form.uf"
                  v-validate="'required'"
                  class="form-control"
                  :options="estadosOptions"
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
import pais from '@/data/pais.json'
import estados from '@/data/estados.json'
import cidades from '@/data/cidades.json'
import pracas from '@/data/praca.json'
import transacao from '@/data/transacionada.json'
import regiao from '@/data/regioes-castanheiras.json'
import localforage from 'localforage'
export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      regiao,
      pracas,
      buyerPositions,
      medidas: [],
      medidasPreco: [],
      loadingMedidas: false,
      selectedMeasurement: null,
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
        day: '',
        month: '',
        year: '',
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
        measurementId: null,
        product: '63ff4160ff65e9001b61c6af',
        uf: '',
        city: '',
        transaction: 'oferta de preços',
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
      isOnline: navigator.onLine,
      meses: [
        { value: '01', text: 'Janeiro' },
        { value: '02', text: 'Fevereiro' },
        { value: '03', text: 'Março' },
        { value: '04', text: 'Abril' },
        { value: '05', text: 'Maio' },
        { value: '06', text: 'Junho' },
        { value: '07', text: 'Julho' },
        { value: '08', text: 'Agosto' },
        { value: '09', text: 'Setembro' },
        { value: '10', text: 'Outubro' },
        { value: '11', text: 'Novembro' },
        { value: '12', text: 'Dezembro' },
      ],
    }
  },
  computed: {
    availableYears() {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 9 }, (_, i) => ({
        value: (currentYear - 7 + i).toString(),
        text: currentYear - 7 + i,
      }))
    },
    availableDays() {
      if (!this.form.month || !this.form.year) {
        return []
      }
      const daysInMonth = new Date(this.form.year, this.form.month, 0).getDate()
      return Array.from({ length: daysInMonth }, (_, i) => ({
        value: (i + 1).toString().padStart(2, '0'),
        text: i + 1,
      }))
    },
    medidasOptions() {
      const placeholder = {
        value: '',
        text: this.loadingMedidas
          ? 'Carregando medidas...'
          : 'Selecione uma medida',
        disabled: true,
      }
      return [placeholder, ...this.medidas]
    },
    totalTransactionValue() {
      return (this.form.transactedQuantity * this.form.originalPrice).toFixed(2)
    },
    estadosOptions() {
      if (!Array.isArray(estados)) {
        return Object.keys(estados).map((uf) => ({ value: uf, text: uf }))
      }

      return estados.map((e) => ({ value: e.uf, text: e.uf }))
    },
    productName() {
      return 'Castanha com casca in natura'
    },
  },
  async created() {
    const now = this.$moment().tz('America/Sao_Paulo')
    this.form.day = now.format('DD')
    this.form.month = now.format('MM')
    this.form.year = now.format('YYYY')

    await this.loadMedidas()

    if (this.isEditing()) {
      await this.edit(this.$route.params.id)
    }

    await this.setMessenger()

    if (!this.isMessenger) {
      await this.listOrganizations()
    }

    await this.loadOrganization()
    await this.preSetDados()

    this.creating = false

    this.loadPracas()
    this.estados.sort(function (x, y) {
      return x.uf.localeCompare(y.uf)
    })
    this.form.transaction = this.form.transactedQuantity
      ? 'preço da venda'
      : 'oferta de preços'

    window.addEventListener('online', this.syncData)
    window.addEventListener('offline', this.updateOnlineStatus)
  },
  beforeDestroy() {
    window.removeEventListener('online', this.syncData)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine
    },
    async loadMedidas() {
      this.loadingMedidas = true
      try {
        const product = await this.$axios.$get(
          `products/${this.form.product}?populate=specie`
        )

        if (product?.specieProduct?.specie?._id) {
          const specieId = product.specieProduct.specie._id

          const measurements = await this.$axios.$get(
            `measurements/species/${specieId}`
          )

          if (measurements && measurements.length > 0) {
            this.medidas = measurements.map((measurement) => ({
              value: measurement.name,
              text: measurement.name,
              measurementId: measurement._id,
              referenceInKg: measurement.referenceInKg,
            }))

            this.medidasPreco = [...this.medidas]
          } else {
            this.usarMedidasFallback()
          }
        } else {
          this.usarMedidasFallback()
        }
      } catch (error) {
        this.usarMedidasFallback()
      }
      this.loadingMedidas = false
    },
    usarMedidasFallback() {
      this.medidas = [
        { value: 'Kg', text: 'Kg' },
        { value: 'Lata', text: 'Lata' },
        { value: 'Caixa', text: 'Caixa' },
        { value: 'Hectolitro', text: 'Hectolitro' },
        { value: 'Saca', text: 'Saca' },
        { value: 'Barrica', text: 'Barrica' },
        { value: 'Tonelada', text: 'Tonelada' },
      ]
      this.medidasPreco = [...this.medidas]
    },
    onMeasureChange() {
      const selectedMedida = this.medidas.find(
        (m) => m.value === this.form.measure
      )
      if (selectedMedida) {
        this.selectedMeasurement = selectedMedida
        this.form.measurementId = selectedMedida.measurementId || null
      }
    },
    async syncData() {
      this.isOnline = true
      const pendingPrices = (await localforage.getItem('pendingPrices')) || []
      if (pendingPrices.length > 0) {
        for (const price of pendingPrices) {
          try {
            await this.$axios.post('price-informations', price)
          } catch (error) {
            console.error('Erro ao sincronizar o preço:', error)
            return
          }
        }
        await localforage.removeItem('pendingPrices')
        this.notify('Preços pendentes sincronizados com sucesso!')
      }
    },
    async listOrganizations() {
      if (this.isMessenger) {
        return
      }

      try {
        const orgs = await this.$axios.$get('organizations')
        this.organizationsOptions = orgs.map((org) => ({
          value: org._id,
          text: org.name,
        }))
      } catch (error) {
        console.error('Erro ao carregar organizações:', error)

        const cachedOrgs = await this.$getCachedData(
          'reference',
          'organizations'
        )
        if (cachedOrgs) {
          this.organizationsOptions = cachedOrgs.map((org) => ({
            value: org._id,
            text: org.name,
          }))
        }
      }
    },
    setMessenger() {
      if (this.isAdmin || this.isGlobalManager || this.isManager) {
        this.form.messenger = this.currentUser._id
      }
    },
    preSetDados() {
      if (this.isEditing() || this.isAdmin || this.isGlobalManager) return

      if (this.$auth.user) {
        this.form.currency = this.$auth.user.currency
        this.form.country = this.$auth.user.country
        this.form.measure = this.$auth.user.unitOfMeasurement
        this.form.uf = this.$auth.user.uf
        this.form.city = this.$auth.user.city
        this.form.buyerPositionSeller = this.$auth.user.buyerPosition
      } else {
        this.$getCachedData('user', 'currentUser').then((userData) => {
          if (userData) {
            this.form.currency = userData.currency
            this.form.country = userData.country
            this.form.measure = userData.unitOfMeasurement
            this.form.uf = userData.uf
            this.form.city = userData.city
            this.form.buyerPositionSeller = userData.buyerPosition
          }
        })
      }
    },
    async loadOrganization() {
      try {
        let organizationId = null

        if (this.isManager || this.isMessenger) {
          organizationId = this.currentUser.organization
        } else {
          organizationId = this.form.organization
        }

        const filters = { role: 'mensageiro' }

        if (this.isMessenger) {
          filters.id = this.currentUser._id
        } else if (organizationId) {
          filters.organization = organizationId
        }

        if (navigator.onLine) {
          if (!this.isMessenger) {
            const organizationsData = await this.$axios.$get('organizations')
            this.organizationsOptions = [
              { value: '', text: 'Selecione uma organização' },
            ].concat(
              organizationsData.map((organization) => ({
                value: organization._id,
                text: organization.name,
              }))
            )
          }

          if (organizationId) {
            const organization = await this.$axios.$get(
              'organizations/' + organizationId
            )
            this.products = organization.products || []
          }

          this.messengers = await this.$axios.$get('users', {
            params: { filters },
          })

          if (this.products) {
            await this.$getCachedData('reference', 'products', this.products)
          }
          if (this.messengers) {
            await this.$getCachedData(
              'reference',
              'currentMessengers',
              this.messengers
            )
          }
        } else {
          if (!this.isMessenger) {
            const cachedOrganizations = await this.$getCachedData(
              'reference',
              'organizations'
            )
            if (cachedOrganizations) {
              this.organizationsOptions = [
                { value: '', text: 'Selecione uma organização' },
              ].concat(
                cachedOrganizations.map((organization) => ({
                  value: organization._id,
                  text: organization.name,
                }))
              )
            }
          }

          if (organizationId) {
            const cachedProducts = await this.$getCachedData(
              'reference',
              'products'
            )
            if (cachedProducts) {
              this.products = cachedProducts
            }
          }

          const cachedMessengers = await this.$getCachedData(
            'reference',
            'currentMessengers'
          )
          if (cachedMessengers) {
            if (this.isMessenger) {
              this.messengers = cachedMessengers.filter(
                (m) => m._id === this.currentUser._id
              )
            } else if (organizationId) {
              this.messengers = cachedMessengers.filter(
                (m) => m.organization === organizationId
              )
            } else {
              this.messengers = cachedMessengers
            }
          }
        }

        this.form.product = '63ff4160ff65e9001b61c6af'
      } catch (error) {
        console.error('Erro ao carregar organizações:', error)
      }
    },
    async loadMessenger() {
      if (this.form.messenger && !this.creating) {
        const selectedMessenger = await this.$axios.$get(
          'users/' + this.form.messenger
        )
        this.form.currency = selectedMessenger.currency
        this.form.country = selectedMessenger.country
        this.form.measure = selectedMessenger.unitOfMeasurement
        this.form.uf = selectedMessenger.uf
        this.form.city = selectedMessenger.city
        this.form.buyerPositionSeller = selectedMessenger.buyerPosition
      }
    },
    loadCities() {
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]

      if (this.form.uf) {
        this.cidades = this.cidades.concat(Object(cidades)[this.form.uf])
      }

      if (this.form.city && this.cidades) {
        if (!this.cidades.find((c) => c === this.form.city)) {
          this.form.city = ''
        }
      }
    },
    async loadPracas() {
      try {
        if (navigator.onLine) {
          const estados = await this.$axios.$get('locations/estados')
          this.estados = estados

          await this.$getCachedData('reference', 'estados', estados)
        } else {
          const cachedEstados = await this.$getCachedData(
            'reference',
            'estados'
          )
          if (cachedEstados) {
            this.estados = cachedEstados
          }
        }

        if (this.form.city && this.form.uf) {
          const regiaoFound = this.regiao.find(
            (item) =>
              item.municipio === this.form.city && item.uf === this.form.uf
          )

          if (regiaoFound) {
            this.form.region = regiaoFound.regiaoCastanheira
          } else {
            this.form.region = ''
          }
        } else {
          this.form.region = ''
        }
      } catch (error) {
        console.error('Erro ao carregar praças:', error)
      }
    },
    transactedQuantity() {
      const multiplyer = this.getMultiplyer(this.form.measure)
      let min = this.form.originalMinimumPrice
      let max = this.form.originalMaximumPrice
      if (this.form.transaction === 'preço da venda') {
        const finalValue = this.form.originalPrice * multiplyer
        this.form.originalMinimumPrice = finalValue
        this.form.originalMaximumPrice = finalValue
      } else if (this.form.transaction === 'oferta de preços') {
        this.form.minimumPrice = +new Decimal(min).div(multiplyer).toFixed(2)
        this.form.maximumPrice = +new Decimal(max).div(multiplyer).toFixed(2)
      }
    },
    getMultiplyer(measure) {
      if (this.selectedMeasurement && this.selectedMeasurement.referenceInKg) {
        return this.selectedMeasurement.referenceInKg
      }

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

      return 1
    },
    async edit(id) {
      this.is_loading = true

      try {
        const dados = await this.$axios.$get(
          'price-informations/' + id + '?populate=measurements'
        )

        this.form.organization = dados.organization
        this.form.messenger = dados.messenger
        this.form.transaction = dados.transaction
        this.form.originalMinimumPrice = dados.originalMinimumPrice || 0
        this.form.originalMaximumPrice = dados.originalMaximumPrice || 0
        this.form.transactedQuantity = dados.transactedQuantity || 0
        this.form.measure = dados.measure
        this.form.measurementId = dados.measurementId?._id || null
        this.form.product = dados.product
        this.form.buyerPositionBuyer = dados.buyerPositionBuyer
        this.form.createdAt = dados.createdAt
        this.form.uf = dados.uf
        this.form.city = dados.city
        this.form.currency = dados.currency
        this.form.country = dados.country
        this.form.buyerPositionSeller = dados.buyerPositionSeller
        this.form.originalPrice = dados.originalPrice || 0
        const date = this.$moment(dados.createdAt)
        this.form.day = date.format('DD')
        this.form.month = date.format('MM')
        this.form.year = date.format('YYYY')

        if (dados.measurementId) {
          this.selectedMeasurement = {
            measurementId: dados.measurementId._id,
            referenceInKg: dados.measurementId.referenceInKg,
            value: dados.measure,
            text: dados.measure,
          }
        }
      } catch (e) {
        this.showError(e)
      }

      this.is_loading = false
    },
    async save() {
      let isValid = await this.$validator.validate()

      if (
        (!this.form.originalMinimumPrice ||
          this.form.originalMinimumPrice === 0) &&
        this.form.transaction === 'oferta de preços'
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
      } else if (this.form.transaction === 'preço da venda') {
        if (
          !this.form.transactedQuantity ||
          this.form.transactedQuantity === 0
        ) {
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
      } else if (!this.form.region) {
        this.veeErrors.items.push({
          id: 104,
          vmId: this.veeErrors.vmId,
          field: 'region',
          msg: 'O município selecionado não faz parte de uma Região Castanheira.',
          rule: 'required',
          scope: null,
        })
        isValid = false
      }
      this.veeErrors.items = this.veeErrors.items.filter(
        (error) =>
          error.id !== 101 &&
          error.id !== 102 &&
          error.id !== 103 &&
          error.id !== 104
      )

      if (this.form.transaction === 'oferta de preços') {
        this.form.transactedQuantity = 0
      }

      let minPricePerKg = this.form.originalMinimumPrice
      let maxPricePerKg = this.form.originalMaximumPrice

      if (this.form.transaction === 'preço da venda') {
        minPricePerKg = this.form.originalPrice
        maxPricePerKg = this.form.originalPrice
      }

      const multiplyer = this.getMultiplyer(this.form.measure)
      minPricePerKg = +new Decimal(minPricePerKg).div(multiplyer).toFixed(2)
      maxPricePerKg = +new Decimal(maxPricePerKg).div(multiplyer).toFixed(2)

      if (minPricePerKg < 1) {
        this.veeErrors.items.push({
          id: 105,
          vmId: this.veeErrors.vmId,
          field: 'originalMinimumPrice',
          msg: 'Revise o preço, valor informado muito baixo.',
          rule: 'min_value',
          scope: null,
        })
        isValid = false
      }

      if (maxPricePerKg > 50) {
        this.veeErrors.items.push({
          id: 106,
          vmId: this.veeErrors.vmId,
          field: 'originalMaximumPrice',
          msg: 'Revise o preço, valor informado muito alto.',
          rule: 'max_value',
          scope: null,
        })
        isValid = false
      }

      if (isValid) {
        this.is_sending = true

        if (this.isAdmin || this.isGlobalManager) {
          this.form.organization = this.messengers.find(
            (messenger) => messenger._id === this.form.messenger
          ).organization._id
        } else {
          this.form.organization = this.currentUser.organization
        }

        if (this.form.transaction === 'oferta de preços') {
          this.form.transactedQuantity = 0
        }

        if ((this.isManager && !this.form.messenger) || this.isMessenger) {
          this.form.messenger = this.currentUser._id
        }

        this.transactedQuantity()

        const priceData = { ...this.form }
        priceData.createdAt = `${this.form.year}-${this.form.month}-${this.form.day}`

        if (this.isOnline) {
          try {
            const resp = await this.$axios({
              method: this.isEditing() ? 'PUT' : 'POST',
              url: this.isEditing()
                ? 'price-informations/' + this.$route.params.id
                : 'price-informations',
              data: priceData,
            })
            const category = resp.data
            if (category && category._id) {
              this.notify('Informações de preço salvo com sucesso')
              setTimeout(() => {
                try {
                  this.$router.replace('/')
                } catch (error) {}
              }, 500)
            }
            this.is_sending = false
          } catch (error) {
            this.showError(error)
            this.is_sending = false
          }
        } else {
          const pendingPrices =
            (await localforage.getItem('pendingPrices')) || []

          priceData.product = '63ff4160ff65e9001b61c6af'

          pendingPrices.push(priceData)
          await localforage.setItem('pendingPrices', pendingPrices)

          this.notify(
            'Preço salvo localmente. Será sincronizado quando estiver online.'
          )
          this.is_sending = false

          setTimeout(() => {
            try {
              this.$router.replace('/')
            } catch (error) {}
          }, 500)
        }
      }
    },
  },
}
</script>
