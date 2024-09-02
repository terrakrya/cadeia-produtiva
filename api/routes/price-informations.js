const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const moment = require('moment')
const convertUnit = require('../utils/convertUnit')
const getModa = require('../utils/moda')
const { processPrices } = require('../utils/priceSummary')

moment.locale('pt-br')
const Price = mongoose.model('PriceInformation')

// Helper function for building query filters
const buildFilters = (filters) => {
  const query = {}

  if (filters.product) query.product = filters.product
  if (filters.regions) query.region = filters.regions
  if (filters.buyerPosition) query.buyerPositionBuyer = filters.buyerPosition
  if (filters.from || filters.to) {
    query.createdAt = {}
    if (filters.from) query.createdAt.$gte = new Date(filters.from)
    if (filters.to) query.createdAt.$lte = new Date(filters.to)
  }

  return query
}

// Route for getting price information
router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  if (req.user.role === 'gestor') {
    query.organization = req.user.organization
  } else if (req.user.role === 'mensageiro') {
    query.messenger = req.user.id
  }

  try {
    const price = await Price.find(query)
      .populate('product')
      .populate('messenger')
      .populate('organization')
      .sort('price')
    res.json(price)
  } catch (err) {
    res
      .status(422)
      .send(`Ocorreu um erro ao carregar a lista de preço: ${err.message}`)
  }
})

// Route for getting harvest mode data
router.get('/harvest-mode', auth.authenticated, async (req, res) => {
  try {
    const query = buildFilters(req.query)
    const prices = await Price.find(query)

    if (!prices.length) return res.json([])

    const modaWeekly = {}

    prices.forEach((price) => {
      const startOfMonth = moment(price.createdAt).startOf('month')
      const weekOfMonth =
        Math.ceil(moment(price.createdAt).diff(startOfMonth, 'days') / 7) + 1
      const formattedWeek = `${moment(price.createdAt)
        .format('MMM/YY')
        .toUpperCase()} - Semana ${weekOfMonth}`

      if (!modaWeekly[formattedWeek]) modaWeekly[formattedWeek] = []
      modaWeekly[formattedWeek].push(
        convertUnit(price.minimumPrice, req.query.unitOfMeasurement),
        convertUnit(price.maximumPrice, req.query.unitOfMeasurement)
      )
    })

    let modaByWeek = Object.keys(modaWeekly).map((week) => ({
      week,
      moda: getModa(modaWeekly[week]),
    }))

    modaByWeek = modaByWeek.sort((a, b) => {
      return moment(a.week.split(' - ')[0], 'MMM/YY').isBefore(
        moment(b.week.split(' - ')[0], 'MMM/YY')
      )
        ? -1
        : 1
    })
    res.json(modaByWeek)
  } catch (err) {
    console.error('Erro ao carregar a lista de preço:', err)
    res
      .status(500)
      .send(`Ocorreu um erro ao carregar a lista de preço: ${err.message}`)
  }
})

// Route for getting summary data
router.get('/summary', auth.authenticated, async (req, res) => {
  const query = buildFilters(req.query)
  const prices = await Price.find(query, {
    region: 1,
    minimumPrice: 1,
    maximumPrice: 1,
  })

  let summary = processPrices(prices, req.query.unitOfMeasurement)

  res.json(summary)
})

// Route for getting data published
router.get('/data-published', auth.authenticated, async (req, res) => {
  const query = buildFilters(JSON.parse(req.query.filters || '{}'))

  try {
    const priceListAgr = await Price.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%d/%m/%Y', date: '$createdAt' } },
            from: '$buyerPositionSeller',
            to: '$buyerPositionBuyer',
          },
          minimumPrice: { $min: '$minimumPrice' },
          maximumPrice: { $max: '$maximumPrice' },
        },
      },
    ])

    const priceList = priceListAgr.map((obj) => ({
      date: obj._id.date,
      from: obj._id.from,
      to: obj._id.to,
      minimumPrice: obj.minimumPrice,
      maximumPrice: obj.maximumPrice,
      averagePrice: (obj.minimumPrice + obj.maximumPrice) / 2,
    }))

    res.json(priceList)
  } catch (err) {
    res
      .status(422)
      .send(`Ocorreu um erro ao carregar a lista de preço: ${err.message}`)
  }
})

// Route for getting price by id
router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const price = await Price.findOne(query).populate(populate(req))
    return res.json(price)
  } catch (err) {
    res.sendStatus(422)
  }
})

// Route for creating new price
router.post('/', auth.authenticated, async (req, res) => {
  try {
    const price = new Price()

    Object.assign(price, req.body)

    await price.save()

    return res.send(price)
  } catch (err) {
    res.status(422).send(`Ocorreu um erro ao incluir o preço: ${err.message}`)
  }
})

// Route for updating price by id
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const price = await Price.findOne(query)

    if (price) {
      Object.assign(price, req.body)

      await price.save()

      return res.send(price)
    } else {
      res.status(422).send('Preço não encontrado')
    }
  } catch (err) {
    res.status(422).send(`Ocorreu um erro ao atualizar o preço: ${err.message}`)
  }
})

// Route for deleting price by id
router.delete('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const price = await Price.findOne(query)
    if (price) {
      await price.remove()
      res.send(price)
    } else {
      res.status(422).send('Preço não encontrado')
    }
  } catch (err) {
    res.status(422).send(`Ocorreu um erro ao excluir o preço: ${err.message}`)
  }
})

module.exports = router
