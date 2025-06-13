<template>
  <div class="user-form">
    <breadcrumb active="Minha conta" />
    <div class="panel">
      <div class="panel-body">
        <loading :loading="is_loading" />
        <b-tabs v-model="activeTabKey">
          <b-tab title="Meu perfil">
            <b-form v-if="!is_loading" @submit.prevent="save">
              <h4 class="mb-4">Complete seu perfil</h4>

              <b-row>
                <b-col sm="4">
                  <b-form-group label="Nome Completo *">
                    <b-form-input
                      v-model="form.name"
                      v-validate="getValidationRules('name')"
                      placeholder="Insira o seu nome completo"
                      name="name"
                    />
                    <field-error :msg="veeErrors" field="name" />
                  </b-form-group>
                </b-col>

                <b-col sm="4">
                  <b-form-group label="Data de nascimento *">
                    <b-form-input
                      v-model="form.birthDate"
                      v-mask="'##/##/####'"
                      v-validate="getValidationRules('birthDate')"
                      placeholder="Insira sua data de nascimento"
                      name="birthDate"
                    />
                    <field-error :msg="veeErrors" field="birthDate" />
                  </b-form-group>
                </b-col>

                <b-col sm="4">
                  <b-form-group label="Apelido">
                    <b-form-input
                      v-model="form.nickname"
                      placeholder="Insira o seu apelido"
                    />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col sm="6">
                  <b-form-group label="E-mail *">
                    <b-form-input
                      v-model="form.email"
                      v-validate="getValidationRules('email')"
                      placeholder="Insira seu email"
                      name="email"
                    />
                    <field-error :msg="veeErrors" field="email" />
                  </b-form-group>
                </b-col>
                <b-col sm="3">
                  <b-form-group label="Gênero">
                    <b-form-select
                      v-model="form.gender"
                      :options="genero"
                      class="form-control"
                    />
                  </b-form-group>
                </b-col>
                <b-col sm="3">
                  <b-form-group label="Celular *">
                    <b-form-input
                      v-model="form.cellphone"
                      v-mask="['(##) ####-####', '(##) #####-####']"
                      v-validate="getValidationRules('cellphone')"
                      placeholder="Insira seu número de celular"
                      name="cellphone"
                    />
                    <field-error :msg="veeErrors" field="cellphone" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col sm="6">
                  <b-form-group label="Identidade">
                    <b-form-select
                      v-model="form.identity"
                      class="form-control"
                      name="identity"
                      :options="identidade"
                    />
                  </b-form-group>
                </b-col>
                <b-col sm="6">
                  <b-form-group label="Posição na cadeia de valor *">
                    <b-form-select
                      v-model="form.buyerPosition"
                      v-validate="getValidationRules('buyerPosition')"
                      class="form-control"
                      name="buyerPosition"
                      :options="buyerPositions"
                    />
                    <field-error :msg="veeErrors" field="buyerPosition" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                <b-col sm="6">
                  <b-form-group label="Produto acompanhado *">
                    <b-form-select
                      v-model="form.productId"
                      v-validate="getValidationRules('productId')"
                      class="form-control"
                      name="productId"
                      :options="produtosOptions"
                      :disabled="loadingProdutos"
                      @input="onProductChange"
                    />
                    <small v-if="loadingProdutos" class="text-muted">
                      Carregando produtos da sua organização...
                    </small>
                    <small v-else-if="produtosOptions.length === 0" class="text-warning">
                      Nenhum produto encontrado para sua organização
                    </small>
                    <field-error :msg="veeErrors" field="productId" />
                  </b-form-group>
                </b-col>
                <b-col sm="6">
                  <b-form-group label="Unidade de medida preferida *">
                    <b-form-select
                      v-model="form.unitOfMeasurement"
                      v-validate="getValidationRules('unitOfMeasurement')"
                      class="form-control"
                      name="unitOfMeasurement"
                      :options="medidasOptions"
                      :disabled="loadingMedidas || !form.productId"
                      @input="onMeasureChange"
                    />
                    <small v-if="loadingMedidas" class="text-muted">
                      Carregando medidas do produto...
                    </small>
                    <small v-else-if="medidasOptions.length === 0" class="text-warning">
                      Nenhuma medida encontrada para este produto
                    </small>
                    <field-error :msg="veeErrors" field="unitOfMeasurement" />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row v-if="isAdmin || isGlobalManager">
                <b-col sm="4">
                  <!-- NOTE: We now use 'value-field="uf"' so that 'form.uf' stores the sigla -->
                  <b-form-group label="Estado de Atuação *">
                    <b-form-select
                      v-model="form.uf"
                      class="form-control"
                      :options="estados"
                      value-field="uf"
                      text-field="nome"
                      @input="loadCities()"
                    />
                  </b-form-group>
                </b-col>

                <b-col sm="4">
                  <b-form-group label="Município de Referência *">
                    <b-form-select
                      v-model="form.city"
                      class="form-control"
                      :options="cidades"
                      value-field="nome"
                      text-field="nome"
                      @input="loadRegion()"
                    />
                  </b-form-group>
                </b-col>

                <b-col sm="4">
                  <b-form-group label="Região Castanheira *">
                    <input
                      v-model="form.region"
                      type="text"
                      name="region"
                      readonly
                      class="form-control"
                    />
                  </b-form-group>
                </b-col>
              </b-row>

              <form-submit :sending="is_sending" />
            </b-form>
          </b-tab>

          <b-tab title="Alterar Senha">
            <h4 class="mb-4">Alterar senha</h4>
            <b-form v-if="!is_loading" @submit.prevent="save">
              <b-row>
                <b-col md="6">
                  <b-form-group label="Insira a nova senha">
                    <b-form-input
                      v-model="form.password"
                      type="password"
                      name="pass"
                    />
                    <field-error :msg="veeErrors" field="pass" />
                  </b-form-group>
                </b-col>
                <b-col md="6">
                  <b-form-group label="Repita a nova senha">
                    <b-form-input
                      v-model="form.password_confirmation"
                      type="password"
                      name="pass_confirmation"
                    />
                    <field-error :msg="veeErrors" field="pass_confirmation" />
                  </b-form-group>
                </b-col>
              </b-row>
              <form-submit :sending="is_sending" />
            </b-form>
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import tipoDeUnidade from '@/data/tipo-de-unidade'
import buyerPositions from '@/data/posicao-do-comprador'
import genero from '@/data/generos.json'
import identidade from '@/data/identidade-cultural.json'
import estados from '@/data/estados.json'
import municipios from '@/data/municipios.json'
import regioes from '@/data/regioes-castanheiras.json'

export default {
  components: {
    Breadcrumb,
  },
  data() {
    return {
      activeTabKey: 0,
      identidade,
      genero,
      tipoDeUnidade,
      buyerPositions,
      estados,
      municipios,
      cidades: [],
      medidas: [],
      loadingMedidas: false,
      selectedMeasurement: null,
      loadingProdutos: false,
      produtos: [],
      form: {
        unitOfMeasurement: '',
        measurementId: null,
        name: '',
        email: '',
        username: '',
        cellphone: '',
        password: '',
        password_confirmation: '',
        buyerPosition: '',
        nickname: '',
        identity: '',
        gender: '',
        birthDate: '',
        uf: '',
        city: '',
        region: '',
        productId: '',
      },
      is_loading: false,
      is_sending: false,
    }
  },
  computed: {
    medidasOptions() {
      const medidasArray = Array.isArray(this.medidas) ? this.medidas : []
      
      return [
        { value: '', text: 'Selecione uma medida...' },
        ...medidasArray.map(medida => ({
          value: medida.value,
          text: medida.text,
          measurementId: medida.measurementId,
          referenceInKg: medida.referenceInKg
        }))
      ]
    },
    produtosOptions() {
      const produtosArray = Array.isArray(this.produtos) ? this.produtos : []
      
      return [
        { value: '', text: 'Selecione um produto...' },
        ...produtosArray.map(produto => ({
          value: produto._id,
          text: produto.name,
          specie: produto.specie
        }))
      ]
    },
    isGlobalManager() {
      return this.currentUser && this.currentUser.role === 'gestor-global'
    },
    isAdmin() {
      return this.currentUser && this.currentUser.role === 'admin'
    },
  },
  created() {
    this.initializeProfile()
  },
  methods: {
    async initializeProfile() {
      // 1. Primeiro carregar os dados do usuário
      await this.edit(this.$route.params.id)
      
      // 2. Carregar produtos da organização
      await this.loadProdutos()
      
      // 3. Se o usuário tem produto selecionado, carregar suas medidas
      if (this.form.productId) {
        await this.loadMedidasPorProduto(this.form.productId)
        
        // 4. Após carregar as medidas, definir a unidade correta se houver measurementId
        if (this.form.measurementId) {
          this.setMeasurementFromId()
        }
      }
    },

    async edit(id) {
      this.is_loading = true
      try {
        const dados = await this.$axios.$get('users/' + id)

        this.form.productId = dados.productId || ''
        this.form.unitOfMeasurement = dados.unitOfMeasurement || ''
        this.form.measurementId = dados.measurementId || null
        this.form.name = dados.name
        this.form.email = dados.email
        this.form.username = dados.username
        this.form.cellphone = dados.cellphone
        this.form.password = ''
        this.form.password_confirmation = ''
        this.form.buyerPosition = dados.buyerPosition
        this.form.birthDate = dados.birthDate
        this.form.nickname = dados.nickname
        this.form.identity = dados.identity
        this.form.gender = dados.gender

        // ← CORREÇÃO: SEMPRE carregar esses campos
        this.form.uf = dados.uf || ''
        this.form.city = dados.city || ''
        this.form.region = dados.region || ''
        
        if (this.form.uf) {
          this.loadCities()
        }
      } catch (e) {
        this.showError(e)
      } finally {
        this.is_loading = false
      }
    },

    async loadProdutos() {
      this.loadingProdutos = true
      try {
        const userOrganization = this.$auth.user.organization
        
        if (userOrganization) {
          const produtos = await this.$axios.$get(
            `products/organization/${userOrganization}`
          )
          
          this.produtos = Array.isArray(produtos) ? produtos : []
          
          if (this.form.productId) {
            const produtoEncontrado = this.produtos.find(p => p._id === this.form.productId)
          }
        } else {
          this.produtos = []
        }
      } catch (error) {
        this.produtos = []
      } finally {
        this.loadingProdutos = false
      }
    },

    async onProductChange() {
      // Limpar medida quando produto muda
      this.form.unitOfMeasurement = ''
      this.form.measurementId = null
      this.medidas = []

      if (this.form.productId) {
        await this.loadMedidasPorProduto(this.form.productId)
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
              text: `${measurement.name} - ${measurement.referenceInKg}kg`,
              measurementId: measurement._id,
              referenceInKg: measurement.referenceInKg,
              hasConflict: measurement.hasConflict,
              specie: measurement.specie
            }))
        } else {
          this.medidas = []
        }
      } catch (error) {
        this.medidas = []
      } finally {
        this.loadingMedidas = false
      }
    },

    onMeasureChange() {
      const selectedMedida = this.medidas.find(
        (m) => m.value === this.form.unitOfMeasurement
      )
      if (selectedMedida) {
        this.selectedMeasurement = selectedMedida
        this.form.measurementId = selectedMedida.measurementId || null
      }
    },

    setMeasurementFromId() {
      // Encontrar a medida correspondente ao measurementId salvo
      let savedMeasurement = null
      
      if (this.form.measurementId) {
        savedMeasurement = this.medidas.find(
          (m) => m.measurementId === this.form.measurementId
        )
      }
      
      // Fallback: se não encontrou por ID, tentar pelo nome da unidade
      if (!savedMeasurement && this.form.unitOfMeasurement) {
        savedMeasurement = this.medidas.find(
          (m) => m.value === this.form.unitOfMeasurement
        )
      }
      
      if (savedMeasurement) {
        this.form.unitOfMeasurement = savedMeasurement.value
        this.selectedMeasurement = savedMeasurement
        // Garantir que o measurementId esteja correto
        this.form.measurementId = savedMeasurement.measurementId
      }
    },

    getValidationRules(fieldName) {
      if (this.activeTabKey !== 0) {
        return ''
      }

      // Campos realmente obrigatórios
      const requiredFields = ['name', 'email', 'cellphone', 'buyerPosition', 'productId', 'unitOfMeasurement']
      
      const staticRules = {
        birthDate: 'min:10',
        cellphone: 'min:14',
      }

      const rules = []
      
      if (requiredFields.includes(fieldName)) {
        rules.push('required')
      }

      if (staticRules[fieldName]) {
        rules.push(staticRules[fieldName])
      }

      return rules.join('|')
    },

    async isNotUniqueEmail(id, email) {
      return !(await this.$axios.$post('users/unique-email', { id, email }))
    },

    async isNotUniqueCellphone(id, cellphone) {
      return !(await this.$axios.$post('users/unique-cellphone', {
        id,
        cellphone,
      }))
    },

    save() {
      this.$validator.validate().then(async (isValid) => {
        if (this.activeTabKey === 0 && this.form.email) {
          const id = this.isEditing() ? this.$route.params.id : null

          // Limpar erros anteriores dos novos campos
          this.veeErrors.items = this.veeErrors.items.filter(
            (error) => error.id !== 107 && error.id !== 108
          )

          // Validação do produto
          if (!this.form.productId) {
            this.veeErrors.items.push({
              id: 107,
              vmId: this.veeErrors.vmId,
              field: 'productId',
              msg: 'O produto é obrigatório.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }

          // Validação da unidade de medida
          if (!this.form.unitOfMeasurement) {
            this.veeErrors.items.push({
              id: 108,
              vmId: this.veeErrors.vmId,
              field: 'unitOfMeasurement',
              msg: 'A unidade de medida é obrigatória.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }

          // formato do email
          if (!/\S+@\S+\.\S+/.test(this.form.email)) {
            this.veeErrors.items.push({
              id: 102,
              vmId: this.veeErrors.vmId,
              field: 'email',
              msg: 'Email com formato inválido.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
          // unicidade do email
          else if (await this.isNotUniqueEmail(id, this.form.email)) {
            this.veeErrors.items.push({
              id: 103,
              vmId: this.veeErrors.vmId,
              field: 'email',
              msg: 'Este email já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
          else if (await this.isNotUniqueCellphone(id, this.form.cellphone)) {
            this.veeErrors.items.push({
              id: 105,
              vmId: this.veeErrors.vmId,
              field: 'cellphone',
              msg: 'Este Celular já existe.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          }
          else if (
            (this.isAdmin || this.isGlobalManager) &&
            !this.form.region
          ) {
            this.veeErrors.items.push({
              id: 106,
              vmId: this.veeErrors.vmId,
              field: 'region',
              msg: 'Município não vinculado a um Território.',
              rule: 'required',
              scope: null,
            })
            isValid = false
          } else {
            this.veeErrors.items = this.veeErrors.items.filter(
              (error) =>
                error.id !== 102 &&
                error.id !== 103 &&
                error.id !== 105 &&
                error.id !== 106 &&
                error.id !== 107 &&
                error.id !== 108
            )
          }
        } else {
          this.veeErrors.items = this.veeErrors.items.filter(
            (error) =>
              error.id !== 102 &&
              error.id !== 103 &&
              error.id !== 104 &&
              error.id !== 105 &&
              error.id !== 106 &&
              error.id !== 107 &&
              error.id !== 108
          )
        }

        if (isValid) {
          this.is_sending = true
          
          try {
            const response = await this.$axios.$put('users/' + this.$route.params.id, this.form)
            
            // Atualizar usuário logado
            this.$auth.setUser(response)
            
            // ← REDIRECIONAMENTO SIMPLES
            this.$router.push('/painel')
            
          } catch (e) {
            this.showError(e)
          } finally {
            this.is_sending = false
          }
        }
      })
    },

    loadCities() {
      if (this.form.uf) {
        const estado = this.estados.find((est) => est.uf === this.form.uf)
        if (estado) {
          this.cidades = this.municipios.filter(
            (item) => item.codigo_uf === estado.codigo_uf
          )
        } else {
          this.cidades = []
        }
      } else {
        this.cidades = []
      }

      if (this.form.city && this.cidades.length) {
        if (!this.cidades.find((c) => c.nome === this.form.city)) {
          this.form.city = ''
          this.form.region = ''
        }
      }
    },

    loadRegion() {
      if (this.form.city) {
        const regiao = regioes.filter(
          (item) => item.municipio === this.form.city
        )
        if (regiao && regiao.length > 0) {
          this.form.region = regiao[0].regiaoCastanheira
        } else {
          this.form.region = ''
        }
      } else {
        this.form.region = ''
      }
    },

    isEditing() {
      return !!this.$route.params.id
    },
  },
}
</script>
