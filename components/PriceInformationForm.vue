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
                  @input="onOrganizationChange"
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
                <b-form-select
                  v-model="form.product"
                  v-validate="'required'"
                  class="form-control"
                  name="product"
                  :options="produtosOptions"
                  :disabled="loadingProdutos"
                  @input="onProductChange"
                />
                <small v-if="loadingProdutos" class="text-muted">
                  Carregando produtos...
                </small>
                <field-error :msg="veeErrors" field="product" />
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
                  @input="onUfChange()"
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
                  @input="onCityChange()"
                />
                <field-error :msg="veeErrors" field="region" />
              </b-form-group>
            </b-col>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <b-form-group label="Região">
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
import localforage from 'localforage'

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      pracas,
      buyerPositions,
      medidas: [],
      medidasPreco: [],
      loadingMedidas: false,
      loadingProdutos: false,
      selectedMeasurement: null,
      produtos: [],
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
        product: '',
        uf: '',
        city: '',
        transaction: 'oferta de preços',
        transactedQuantity: '',
        organization: '',
        square: '',
        squareid: '',
        region: '',
        regionId: '',
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
    
    produtosOptions() {
      const produtosArray = Array.isArray(this.produtos) ? this.produtos : []
      
      return [
        { value: '', text: 'Selecione um produto...' },
        ...produtosArray.map(produto => ({
          value: produto._id,
          text: produto.name
        }))
      ]
    },
    
    medidasOptions() {
      const placeholder = {
        value: '',
        text: this.loadingMedidas
          ? 'Carregando medidas...'
          : this.form.product ? 'Selecione uma medida' : 'Selecione um produto primeiro',
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
  },
  async created() {
    const now = this.$moment().tz('America/Sao_Paulo')
    this.form.day = now.format('DD')
    this.form.month = now.format('MM')
    this.form.year = now.format('YYYY')

    if (this.isEditing()) {
      await this.edit(this.$route.params.id)
    }

    await this.setMessenger()

    await this.preSetDados()

    if (!this.isMessenger) {
      await this.listOrganizations()
    }

    await this.loadOrganization()
    
    await this.loadProdutos()

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

    async loadProdutos() {
      this.loadingProdutos = true
      try {
        let organizationId = null

        if (this.isManager || this.isMessenger) {
          organizationId = this.currentUser.organization
        } else {
          organizationId = this.form.organization
        }
        
        if (organizationId) {
          const produtos = await this.$axios.$get(
            `products/organization/${organizationId}`
          )
          
          this.produtos = Array.isArray(produtos) ? produtos : []
        } else {
          this.produtos = []
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        this.produtos = []
      } finally {
        this.loadingProdutos = false
      }
    },

    async onOrganizationChange() {
      // Limpar produto, medidas e região
      this.form.product = ''
      this.form.measure = ''
      this.form.measurementId = null
      this.form.region = ''
      this.medidas = []
      this.produtos = []
      
      // Recarregar produtos da nova organização
      await this.loadProdutos()
    },

    async onProductChange() {
      // Limpar medida e região quando produto muda
      this.form.measure = ''
      this.form.measurementId = null
      this.form.region = ''
      this.medidas = []
      this.selectedMeasurement = null

      if (this.form.product) {
        // Carregar medidas do produto
        await this.loadMedidasPorProduto(this.form.product)
        
        // Carregar região baseada no produto + localização
        await this.loadRegionByProductAndLocation(this.form.product)
      }
    },

    async loadRegionByProductAndLocation(productId) {
      try {

        if (!this.form.uf || !this.form.city) {
          this.form.region = ''
          return
        }

        const response = await this.$axios.$get(
          `regions/product/${productId}/user-location`,
          {
            params: {
              uf: this.form.uf,
              city: this.form.city
            }
          }
        )
        
        if (response.region) {
          this.form.region = response.region
        } 
      } catch (error) {
        console.error('Erro ao carregar região por produto e localização:', error)
      }
    },

    onUfChange() {
      this.form.region = ''
      
      this.loadCities()
    },
 
    onCityChange() {
      // Limpar região
      this.form.region = ''
      
      // Recarregar região se temos produto
      if (this.form.product && this.form.city && this.form.uf) {
        this.loadRegionByProductAndLocation(this.form.product)
      }
    },

    async loadMedidasPorProduto(productId) {
      this.loadingMedidas = true
      try {
        const measurements = await this.$axios.$get(
          `measurements/product/${productId}`
        )

        if (measurements && measurements.length > 0) {
          this.medidas = measurements
            .sort((a, b) => a.referenceInKg - b.referenceInKg)
            .map((measurement) => ({
              value: measurement.originalName,
              text: measurement.name,
              measurementId: measurement._id,
              referenceInKg: measurement.referenceInKg,
            }))
        } else {
          this.medidas = []
        }
      } catch (error) {
        console.error('Erro ao carregar medidas do produto:', error)
        this.medidas = []
      } finally {
        this.loadingMedidas = false
      }
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

    async preSetDados() {
      if (this.isEditing() || this.isAdmin || this.isGlobalManager) return

      if (this.$auth.user) {
        this.form.currency = this.$auth.user.currency
        this.form.country = this.$auth.user.country
        this.form.measure = this.$auth.user.unitOfMeasurement
        this.form.measurementId = this.$auth.user.measurementId
        this.form.uf = this.$auth.user.uf
        this.form.city = this.$auth.user.city
        this.form.buyerPositionSeller = this.$auth.user.buyerPosition
        this.form.region = this.$auth.user.region
        this.form.regionId = this.$auth.user.regionId
        
        if (this.$auth.user.productId) {
          this.form.product = this.$auth.user.productId
          // Carregar medidas do produto do usuário
          await this.loadMedidasPorProduto(this.$auth.user.productId)
          
          // NOVO: carregar região baseada no produto + localização do usuário
          await this.loadRegionByProductAndLocation(this.$auth.user.productId)
          
          // Definir medida padrão se usuário tiver uma definida
          if (this.$auth.user.unitOfMeasurement) {
            this.form.measure = this.$auth.user.unitOfMeasurement
            this.onMeasureChange()
          }
        }
      } else {
        // Fallback para dados em cache
        
        this.$getCachedData('user', 'currentUser').then(async (userData) => {
          if (userData) {
            this.form.currency = userData.currency
            this.form.country = userData.country
            this.form.measure = userData.unitOfMeasurement
            this.form.measurementId = userData.measurementId
            this.form.uf = userData.uf
            this.form.city = userData.city
            this.form.buyerPositionSeller = userData.buyerPosition
            this.form.region = userData.region
            this.form.regionId = userData.regionId
            
            if (userData.productId) {
              this.form.product = userData.productId
              await this.loadMedidasPorProduto(userData.productId)
              
              // NOVO: carregar região baseada no produto + localização do usuário
              await this.loadRegionByProductAndLocation(userData.productId)
              
              if (userData.unitOfMeasurement) {
                this.form.measure = userData.unitOfMeasurement
                this.onMeasureChange()
              }
            }
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

          this.messengers = await this.$axios.$get('users', {
            params: { filters },
          })

          if (this.messengers) {
            await this.$getCachedData(
              'reference',
              'currentMessengers',
              this.messengers
            )
          }
        } else {
          // Fallback offline
          const cachedMessengers = await this.$getCachedData(
            'reference',
            'currentMessengers'
          )
          if (cachedMessengers) {
            this.messengers = cachedMessengers
          }
        }
      } catch (error) {
        console.error('Erro ao carregar organização:', error)
      }
    },

    async loadMessenger() {
      if (this.form.messenger && !this.creating) {
        const selectedMessenger = await this.$axios.$get(
          'users/' + this.form.messenger
        )
        
        if (selectedMessenger.organization) {
          this.form.organization = selectedMessenger.organization
          await this.loadProdutos()
        }
        
        this.form.currency = selectedMessenger.currency
        this.form.country = selectedMessenger.country
        this.form.measure = selectedMessenger.unitOfMeasurement
        this.form.measurementId = selectedMessenger.measurementId
        this.form.uf = selectedMessenger.uf
        this.form.city = selectedMessenger.city
        this.form.buyerPositionSeller = selectedMessenger.buyerPosition
        this.form.region = selectedMessenger.region
        this.form.regionId = selectedMessenger.regionId
        
        if (selectedMessenger.productId) {
          this.form.product = selectedMessenger.productId
          await this.loadMedidasPorProduto(selectedMessenger.productId)
          
          // NOVO: carregar região baseada no produto + localização do mensageiro
          await this.loadRegionByProductAndLocation(selectedMessenger.productId)
          
          if (selectedMessenger.unitOfMeasurement) {
            this.form.measure = selectedMessenger.unitOfMeasurement
            this.onMeasureChange()
          }
        } else if (this.form.product) {
          // Se mensageiro não tem produto mas já temos um produto selecionado,
          // recarregar região com nova localização
          await this.loadRegionByProductAndLocation(this.form.product)
        }
      }
    },

    loadCities() {
      this.cidades = [{ value: '', text: 'Selecione a cidade' }]

      if (this.form.uf) {
        const cidadesDoEstado = Object(cidades)[this.form.uf] || []
        const cidadesFormatadas = cidadesDoEstado.map(cidade => ({
          value: cidade,
          text: cidade
        }))
        this.cidades = this.cidades.concat(cidadesFormatadas)
      }

      if (this.form.city && this.cidades) {
        if (!this.cidades.find((c) => c.value === this.form.city)) {
          this.form.city = ''
          this.form.region = ''
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

        if (this.form.product && this.form.city && this.form.uf) {
          await this.loadRegionByProductAndLocation(this.form.product)
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

      throw new Error(`Unidade de medida '${measure}' não possui referência configurada`)
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
        this.form.product = dados.product._id || dados.product
        this.form.buyerPositionBuyer = dados.buyerPositionBuyer
        this.form.createdAt = dados.createdAt
        this.form.uf = dados.uf
        this.form.city = dados.city
        this.form.currency = dados.currency
        this.form.country = dados.country
        this.form.buyerPositionSeller = dados.buyerPositionSeller
        this.form.originalPrice = dados.originalPrice || 0
        this.form.region = dados.region
        this.form.regionId = dados.regionId
        
        const date = this.$moment(dados.createdAt)
        this.form.day = date.format('DD')
        this.form.month = date.format('MM')
        this.form.year = date.format('YYYY')

        if (this.form.product) {
          await this.loadMedidasPorProduto(this.form.product)
        }

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

      if (!this.form.product) {
        this.veeErrors.items.push({
          id: 109,
          vmId: this.veeErrors.vmId,
          field: 'product',
          msg: 'Selecione um produto.',
          rule: 'required',
          scope: null,
        })
        isValid = false
      }

      // Validação measurementId
      if (!this.form.measurementId) {
        this.veeErrors.items.push({
          id: 107,
          vmId: this.veeErrors.vmId,
          field: 'measure',
          msg: 'Selecione uma unidade de medida válida.',
          rule: 'required',
          scope: null,
        })
        isValid = false
      }

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
      }

      this.veeErrors.items = this.veeErrors.items.filter(
        (error) =>
          error.id !== 101 &&
          error.id !== 102 &&
          error.id !== 103 &&
          error.id !== 104 &&
          error.id !== 107 &&
          error.id !== 109
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

      try {
        const multiplyer = this.getMultiplyer(this.form.measure)
        minPricePerKg = +new Decimal(minPricePerKg).div(multiplyer).toFixed(2)
        maxPricePerKg = +new Decimal(maxPricePerKg).div(multiplyer).toFixed(2)
      } catch (error) {
        this.notify(`Erro: ${error.message}`, 'error')
        this.is_sending = false
        return
      }

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
          // Salvar offline
          const pendingPrices = (await localforage.getItem('pendingPrices')) || []
          pendingPrices.push(priceData)
          await localforage.setItem('pendingPrices', pendingPrices)
          this.notify('Preço salvo localmente. Será sincronizado quando voltar online.')
          this.is_sending = false
          setTimeout(() => {
            try {
              this.$router.replace('/')
            } catch (error) {}
          }, 500)
        }
      }
    },

    isEditing() {
      return !!this.$route.params.id
    },
  },
}
</script>