const slugify = require('slugify')

const getNames = (scientificName, qtdWords = 2) => {
  return scientificName
    .trim()
    .replace(' cf.', ' ')
    .replace(' L.', ' ')
    .replace(' sp.', ' ')
    .replace('2019', '')
    .replace('(', ' ')
    .replace(')', ' ')
    .replace('.', ' ')
    .replace(/\s{2,}/g, ' ')
    .replace('.', ' ')
    .replace('-', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, qtdWords)
    .join(' ')
}

const generateSlug = (scientificName, qtdWords = 2) => {
  return slugify(getNames(scientificName, qtdWords)).toLowerCase()
}

module.exports = {
  generateSlug,

  populate(req) {
    let populate = req.query.populate

    if (populate) {
      if (populate && populate.search('{') !== -1) {
        populate = JSON.parse(req.query.populate)
      }
    } else {
      populate = ''
    }

    return populate
  },

  select(req) {
    let select = req.query.select

    if (select) {
      if (select && select.search('{') !== -1) {
        select = JSON.parse(req.query.select)
      }
    } else {
      select = ''
    }

    return select
  },

  sumArray(arr, prop, propToMultiply) {
    let values = []

    if (propToMultiply !== null) {
      values = arr.map((item) =>
        parseFloat(item[prop] * item[propToMultiply] || 0)
      )
    } else {
      values = arr.map((item) => parseFloat(item[prop] || 0))
    }

    if (values && values.length) {
      return values.reduce((a, b) => a + b, 0)
    } else {
      return 0
    }
  },
}
