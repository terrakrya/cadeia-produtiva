import Vue from 'vue'
import Vue2Filters from 'vue2-filters'

const Vue2FiltersConfig = {
  currency: {
    symbol: 'R$ ',
    decimalDigits: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
}

Vue.use(Vue2Filters, Vue2FiltersConfig)

// formata um valor como moeda
Vue.filter('moeda', (value) => {
  return Vue.options.filters.currency(value)
})

// formata um valor como peso
Vue.filter('kg', (value) => {
  const kg =
    parseFloat(value || 0)
      .toFixed(3)
      .replace('.', ',') + ' kg'
  return kg
})

// formata um valor como quantidade
Vue.filter('qtd', (value) => {
  const kg = parseFloat(value || 0)
    .toFixed(3)
    .replace('.', ',')
  return kg
})

Vue.filter('percentage', (value) => {
  return Number(value).toLocaleString(undefined, {
    style: 'percent',
    minimumFractionDigits: 2,
  })
})
