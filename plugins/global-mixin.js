import Vue from 'vue'
import * as cpf from '@fnando/cpf'
import * as cnpj from '@fnando/cnpj'
import Decimal from 'decimal.js'
import api from '@/api/api'
const bson = require('bson')

if (!Vue.__my_mixin__) {
  Vue.__my_mixin__ = true

  const globalMixin = {
    data() {
      return {
        is_loading: false,
        is_sending: false,
      }
    },
    computed: {
      currentUser() {
        return this.$auth.user
      },
      isAdmin() {
        return this.hasRole('admin')
      },
      baseUrl() {
        return this.$axios.defaults.baseURL.replace('/api', '')
      },
    },
    methods: {
      // verifica se o usuário tem determinado perfil
      hasRole(role) {
        const currentUser = this.currentUser
        if (currentUser && currentUser.role) {
          return currentUser.role === role
        }
        return false
      },

      // usado nos forulários pra saber se está editando ou cadastrando um item
      isEditing() {
        return !!this.$route.params.id
      },

      // copia os dados que vem da api para o formulário. Usado nos formulários de edição.
      apiDataToForm(form, data) {
        Object.keys(form).forEach((key) => {
          if (data && data[key]) {
            if (
              typeof data[key] === 'string' &&
              data[key].includes('T00:00:00.000Z') &&
              key !== 'date_time'
            ) {
              form[key] = data[key].replace(/T00:00:00.000Z/g, '')
            } else {
              form[key] = data[key]
            }
          }
        })
      },

      // pega um item de alguma lista no state
      get(type, id) {
        if (this.$store.state[type]) {
          return this.$store.state[type][id]
        }
      },

      // pega uma lista de objetos de um tipo
      getList(type) {
        if (this.$store.state[type]) {
          return Object.values(this.$store.state[type])
        }
        return []
      },

      // salva ou atualiza algum item na api/state
      async saveOrUpdate(type, form, id) {
        // desabilita botão de submit
        this.is_sending = true

        // monta a request. Se estiver editando adiciona o método PUT e o id na url
        const request = {
          method: id ? 'PUT' : 'POST',
          url: type + (id ? '/' + id : ''),
          data: form,
        }

        try {
          // envia o post/put na api
          const resp = await this.$axios(request)
          // se salvou atualiza a lista no store
          const item = resp.data
          if (item && item._id) {
            this.$store.commit('updateList', {
              type,
              item,
            })
          }
          return item
        } catch (error) {
          // se falhar e o erro for Network Error (falha de rede) adiciona o item na fila de salvamento/atualização
          if (error && !error.response && error.message === 'Network Error') {
            return this.addToPool(type, request, id)
          } else {
            this.showError(error)
          }
        }

        this.is_loading = false
      },

      // exclui um ítem do banco de dados
      async delete(type, id) {
        // exibe caixa de confirmação
        const confirmed = await this.$bvModal.msgBoxConfirm(
          'Tem certeza que deseja excluír?'
        )
        if (confirmed) {
          // se confirmado deleta na api
          await this.$axios.delete(type + '/' + id).catch(this.showError)
          // atualiza o state
          const items = this.$store.state[type]
          delete items[id]
          this.$store.commit('set', { type, items })
        }
        return confirmed
      },

      // adiciona na fila de salvamento/atualização
      addToPool(type, request, id) {
        const item = {
          type,
          id,
          request,
        }
        if (!item.id) {
          item.id = new bson.ObjectId().toString()
        }
        item.request.data._id = item.id
        this.$store.commit('addToSavePool', item)
        return request.data
      },

      // carrega uma lista da api no state
      async load(type, loadAll) {
        const params = {}

        // verifica o tipo de dado e redireciona pra url certa da api em caso de users
        let modelType = type
        if (type === 'collectors') {
          params.role = 'collector'
          modelType = 'users'
        } else if (type === 'clients') {
          params.role = 'client'
          modelType = 'users'
        }

        // pega a lista atual
        let items = this.getList(type)

        // parametro loadAll for true remove os index que já estão salvos na api da lista pra atualizar
        if (loadAll) {
          items = items.filter((item) => !item.updatedAt)
        }

        // Se o parametro loadAll for false e já existe algum item dessa lista já no cache: adiciona a data da última alteração como filtro na request
        // Assim só vai retornar dados a partir dessa data ou seja só novas alterações
        if (items.length > 0 && !loadAll) {
          params.updated_after = items
            .filter((item) => item.updatedAt)
            .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
            .reverse()[0].updatedAt
        }

        // busca a lista na api e soma com a lista atual
        const listFromApi = await api
          .list(modelType, params)
          .catch(this.showError)

        // se retornou algo da api adiciona na lista
        if (listFromApi) {
          items = items.concat(listFromApi)
          const indexedItems = {}
          items.forEach((item) => {
            indexedItems[item._id] = item
          })

          // seta a lista indexada no state
          this.$store.commit('set', { type, items: indexedItems })
        }
      },

      // busca uma lista na api
      async loadList(type, filters) {
        return await api.loadList(type, filters).catch(this.showError)
      },

      // método padrão para tratar os erros da api
      showError(error) {
        if (error.response) {
          if (error.response.data) {
            if (
              error.response.status === 401 &&
              error.response.data.includes('invalid signature')
            ) {
              this.notify('session_expired', 'error')
              this.$auth.logout()
              this.$router.replace('/')
            } else if (error.response.data.message) {
              this.notify(error.response.data.message, 'error')
            } else {
              this.notify(error.response.data, 'error')
            }
          } else {
            this.notify(error.response, 'error')
          }
        }
        this.is_loading = false
        this.is_sending = false
      },

      // formata o nome da cidade no padrão: Cidade - UF
      formatCity(address) {
        return address
          ? [address.city, address.uf].filter(Boolean).join(' - ')
          : ''
      },

      // converte um valor para Decimal do decimal.js
      toDecimal(value) {
        return new Decimal(value)
      },

      // soma vários valores usando decimal.js
      sumDecimal() {
        const args = Array.from(arguments)
        const sum = args.reduce((a, b) => Decimal.sum(a || 0, b || 0), 0)
        return sum
      },

      // subtrai vários valores usando decimal.js
      subtractDecimal() {
        const args = Array.from(arguments)
        const sub = args.reduce((a, b) => Decimal.sub(a || 0, b || 0), 0)
        return sub
      },

      // método padrão para exibir notificações
      notify(msg, type) {
        this.$notify({
          type: type || 'success',
          text: msg,
        })
      },

      // pega um item do banco de dados do navegador (indexDb)
      async getLocalItem(key) {
        return await this.$localForage.getItem(key)
      },

      // seta um item no banco de dados do navegador (indexDb)
      async setLocalItem(key, value) {
        return await this.$localForage.setItem(key, value)
      },
    },

    filters: {
      // formata CPF
      cpf(value) {
        return cpf.format(value)
      },

      // formata CNPJ
      cnpj(value) {
        return cnpj.format(value)
      },

      // formata dados em pt-BR
      data(value) {
        return value.toLocaleDateString('pt-BR')
      },

      // formata endereço
      address(address) {
        return address
          ? [address.address, address.city, address.uf, address.postal_code]
              .filter(Boolean)
              .join(' - ')
          : ''
      },

      // formata cidade
      city(address) {
        return address
          ? [address.city, address.uf].filter(Boolean).join(' - ')
          : ''
      },

      // formata nome do arquivo
      filename(fileUrl) {
        if (fileUrl) {
          const urlArr = fileUrl.split('/')
          return urlArr[urlArr.length - 1]
        }
        return ''
      },
    },
  }

  Vue.mixin(globalMixin)
}
