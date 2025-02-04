const mongoose = require('mongoose')
const router = require('express').Router()
const authenticateToken = require('../config/api-auth')
const User = mongoose.model('User')
const Price = mongoose.model('PriceInformation')
const convertUnit = require('../utils/convertUnit')

router.get('/user-by-phone/:cellphone', authenticateToken, async (req, res) => {
  try {
    if (!req.params.cellphone) {
      return res.status(400).json({ message: 'Número de telefone é obrigatório' })
    }

    const cleanPhone = req.params.cellphone.replace(/\D/g, '')
    const user = await User.findOne({ cellphone: cleanPhone })
      .populate('organization')
      .select('-hash -salt')

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    return res.json(user)
  } catch (err) {
    res.status(422).json({ message: 'Erro ao buscar usuário: ' + err.message })
  }
})

router.get('/prices-by-region/:region', authenticateToken, async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'messenger',
          foreignField: '_id',
          as: 'messengerDetails'
        }
      },
      {
        $unwind: {
          path: '$messengerDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          'messengerDetails.region': req.params.region
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          price: 1,
          minimumPrice: 1,
          maximumPrice: 1,
          date: '$createdAt',
          product: {
            _id: '$productDetails._id',
            name: '$productDetails.name'
          },
          messenger: '$messengerDetails._id',
          messengerDetails: {
            _id: '$messengerDetails._id',
            name: '$messengerDetails.name',
            email: '$messengerDetails.email',
            cellphone: '$messengerDetails.cellphone',
            role: '$messengerDetails.role',
            region: '$messengerDetails.region'
          }
        }
      }
    ]

    const prices = await Price.aggregate(pipeline)
    res.json(prices)
  } catch (err) {
    res.status(422).json({ message: 'Erro ao buscar preços: ' + err.message })
  }
})

router.get('/prices-summary/:region', authenticateToken, async (req, res) => {
  try {
    const region = req.params.region
    const currentYear = new Date().getFullYear()
    const defaultStartDate = new Date(currentYear - 1, 9, 1) // October 1st of last year
    const defaultEndDate = new Date(currentYear, 8, 30) // September 30th of current year

    // Use query-provided date filter if passed; otherwise, use the default range.
    const startDate = req.query.dateFrom ? new Date(req.query.dateFrom) : defaultStartDate
    const endDate = req.query.dateTo ? new Date(req.query.dateTo) : defaultEndDate

    // Find Price records for the given region within the determined date range.
    const prices = await Price.find({
      region,
      createdAt: { $gte: startDate, $lte: endDate }
    })

    if (!prices.length) {
      return res.json({ message: `No prices found for region: ${region}` })
    }

    let minPrice = Infinity
    let maxPrice = -Infinity
    let total = 0
    let count = 0
    let priceValues = []

    prices.forEach(price => {
      const min = price.minimumPrice
      const max = price.maximumPrice

      if (min < minPrice) minPrice = min
      if (max > maxPrice) maxPrice = max

      total += (min + max)
      count++
      priceValues.push(min, max)
    })

    const averagePrice = total / (2 * count)
    const getModa = require('../utils/moda')
    const mode = getModa(priceValues)

    // Retrieve the unit of measurement from the query; default is 'Kg'
    const unit = req.query.unitOfMeasurement || 'Kg'

    res.json({
      totalInputs: count,
      minimumPrice: Math.round(convertUnit(minPrice, unit) * 100) / 100,
      maximumPrice: Math.round(convertUnit(maxPrice, unit) * 100) / 100,
      averagePrice: Math.round(convertUnit(averagePrice, unit) * 100) / 100,
      mode: Math.round(convertUnit(mode, unit) * 100) / 100
    })
  } catch (err) {
    res.status(422).json({ message: 'Error retrieving summary: ' + err.message })
  }
})

module.exports = router
