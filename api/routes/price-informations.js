const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const moment = require('moment')
const convertUnit = require('../utils/convertUnit')
const getModa = require('../utils/moda')
const { processSquares } = require('../utils/priceSummary')
const convertUnitDynamic = require('../utils/convertUnitDynamic')
const User = mongoose.model('User')

moment.locale('pt-br')
const Price = mongoose.model('PriceInformation')

// Helper function for building query filters
const buildFilters = (filters) => {
  const query = {}

  if (filters.product) query.product = filters.product
  if (filters.regions) query.region = filters.regions
  if (filters.buyerPosition) query.buyerPositionBuyer = filters.buyerPosition
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {}
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom)
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo)
  }
  if (filters.from || filters.to) {
    query.createdAt = {}
    if (filters.from) query.createdAt.$gte = new Date(filters.from)
    if (filters.to) query.createdAt.$lte = new Date(filters.to)
  }
  if (filters.buyerFrom) query.buyerPositionSeller = filters.buyerFrom
  if (filters.buyerTo) query.buyerPositionBuyer = filters.buyerTo
  if (filters.uf) query.uf = filters.uf
  if (filters.city) query.city = filters.city

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
    let priceQuery = Price.find(query)
      .populate('product')
      .populate('messenger')
      .populate('organization')

    // Se precisar de informações das medidas dinâmicas
    if (
      req.query.populate === 'measurements' ||
      req.query.populate === 'full'
    ) {
      priceQuery = priceQuery.populate({
        path: 'measurementId',
        select: 'name referenceInKg',
      })
    }

    const prices = await priceQuery.sort('createdAt').exec()
    res.json(prices)
  } catch (err) {
    res
      .status(422)
      .send(`Ocorreu um erro ao carregar a lista de preço: ${err.message}`)
  }
})

// Route for getting harvest mode data with dynamic conversion
router.get('/harvest-mode', auth.authenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).send('Usuário não encontrado')
    }

    const query = buildFilters(req.query)
    const prices = await Price.find(query)

    if (!prices.length) return res.json([])

    const modaWeekly = {}

    for (const price of prices) {
      const startOfMonth = moment(price.createdAt).startOf('month')
      const weekOfMonth =
        Math.ceil(moment(price.createdAt).diff(startOfMonth, 'days') / 7) + 1
      const formattedWeek = `${moment(price.createdAt)
        .format('MMM/YY')
        .toUpperCase()} - Semana ${weekOfMonth}`

      if (!modaWeekly[formattedWeek]) modaWeekly[formattedWeek] = []
      
      // ← USAR CONVERSÃO DINÂMICA baseada no usuário
      const minPrice = await convertUnitDynamic(price.minimumPrice, user)
      const maxPrice = await convertUnitDynamic(price.maximumPrice, user)
      
      modaWeekly[formattedWeek].push(parseFloat(minPrice), parseFloat(maxPrice))
    }

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

// Route for getting summary data with dynamic conversion
router.get('/summary', auth.authenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).send('Usuário não encontrado')
    }

    const query = buildFilters(req.query)
    const prices = await Price.find(query, {
      region: 1,
      minimumPrice: 1,
      maximumPrice: 1,
    })

    let summary = await processSummaryDynamic(prices, user)
    res.json(summary)
  } catch (err) {
    res.status(500).send(`Erro interno: ${err.message}`)
  }
})

// Processar resumo com conversão dinâmica  
const processSummaryDynamic = async (prices, user) => {
  const squares = new Map()

  for (const price of prices) {
    try {
      const minimumPrice = await convertUnitDynamic(price.minimumPrice, user)
      const maximumPrice = await convertUnitDynamic(price.maximumPrice, user)
      
      const minPrice = parseFloat(minimumPrice)
      const maxPrice = parseFloat(maximumPrice)

      if (isNaN(minPrice) || isNaN(maxPrice)) continue

      const squareName = price.region || 'Região não informada'

      if (!squares.has(squareName)) {
        squares.set(squareName, {
          minimumPrice: minPrice,
          maximumPrice: maxPrice,
          totalPrice: minPrice + maxPrice,
          count: 1,
          priceValues: [minPrice, maxPrice],
        })
      } else {
        const square = squares.get(squareName)
        square.minimumPrice = Math.min(square.minimumPrice, minPrice)
        square.maximumPrice = Math.max(square.maximumPrice, maxPrice)
        square.totalPrice += minPrice + maxPrice
        square.count += 1
        square.priceValues.push(minPrice, maxPrice)
      }
    } catch (error) {
      continue
    }
  }

  const squaresArray = Array.from(squares.keys()).map((key) => {
    const square = squares.get(key)
    const averagePrice = square.totalPrice / (square.count * 2)

    return {
      name: key,
      minimumPrice: Math.round(square.minimumPrice * 100) / 100,
      maximumPrice: Math.round(square.maximumPrice * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100,
      moda: getModa(square.priceValues),
      totalPrices: square.count,
    }
  })

  squaresArray.sort((a, b) => b.averagePrice - a.averagePrice)
  return squaresArray
}

// Route for getting data published
router.get('/data-published', auth.authenticated, async (req, res) => {
  try {
    const { region, ...otherFilters } = JSON.parse(req.query.filters || '{}')

    const match = buildFilters(otherFilters)
    if (otherFilters.product) {
      match.product = mongoose.Types.ObjectId(otherFilters.product)
    }

    if (otherFilters.dateFrom || otherFilters.dateTo) {
      match.createdAt = {}
      if (otherFilters.dateFrom)
        match.createdAt.$gte = new Date(otherFilters.dateFrom)
      if (otherFilters.dateTo)
        match.createdAt.$lte = new Date(otherFilters.dateTo)
    }

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'messenger',
          foreignField: '_id',
          as: 'messengerDetails',
        },
      },
      {
        $unwind: {
          path: '$messengerDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // ← NOVO: Lookup para measurementId
      {
        $lookup: {
          from: 'measurements',
          localField: 'measurementId',
          foreignField: '_id',
          as: 'measurementDetails',
        },
      },
      {
        $unwind: {
          path: '$measurementDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]

    const priceListAgr = await Price.aggregate(pipeline)

    const priceList = priceListAgr.map((item) => ({
      date: item.createdAt
        ? moment(item.createdAt).format('DD/MM/YYYY')
        : 'Data inválida',
      buyerFrom: item.buyerPositionSeller,
      buyerTo: item.buyerPositionBuyer,
      minimumPrice: item.minimumPrice,
      maximumPrice: item.maximumPrice,
      averagePrice: (item.minimumPrice + item.maximumPrice) / 2,
      messenger: item.messengerDetails
        ? item.messengerDetails.name || 'Não informado'
        : 'Não informado',
      region: item.region || 'Não informado',
      city: item.city || 'Não informado',
      // ← NOVO: Informações da medida dinâmica
      measure: item.measure || 'Não informado',
      measurementName: item.measurementDetails
        ? item.measurementDetails.name || item.measure
        : item.measure || 'Não informado',
      measurementReference: item.measurementDetails
        ? `${item.measurementDetails.referenceInKg}kg`
        : 'Valor padrão',
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
    let priceQuery = Price.findOne(query)
      .populate('product')
      .populate('messenger')
      .populate('organization')

    // Se precisar de informações da medida dinâmica
    if (
      req.query.populate === 'measurements' ||
      req.query.populate === 'full'
    ) {
      priceQuery = priceQuery.populate({
        path: 'measurementId',
        select: 'name referenceInKg',
      })
    }

    const price = await priceQuery.exec()
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
