const mongoose = require('mongoose')
const router = require('express').Router()
const authenticateToken = require('../config/api-auth')
const User = mongoose.model('User')
const Price = mongoose.model('PriceInformation')
const convertUnit = require('../utils/convertUnit')

router.get('/user-by-phone/:cellphone', authenticateToken, async (req, res) => {
  try {
    if (!req.params.cellphone) {
      return res
        .status(400)
        .json({ message: 'Número de telefone é obrigatório' })
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
          as: 'messengerDetails',
        },
      },
      {
        $unwind: {
          path: '$messengerDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'messengerDetails.region': req.params.region,
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true,
        },
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
            name: '$productDetails.name',
          },
          messenger: '$messengerDetails._id',
          messengerDetails: {
            _id: '$messengerDetails._id',
            name: '$messengerDetails.name',
            email: '$messengerDetails.email',
            cellphone: '$messengerDetails.cellphone',
            role: '$messengerDetails.role',
            region: '$messengerDetails.region',
          },
        },
      },
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

    let startDate, endDate;

    if (req.body && req.query.period) {
      if (req.query.period === 'Semana') {
        // Last 7 days
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        endDate = new Date()
      } else if (req.query.period === 'Mes') {
        // Last 30 days
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        endDate = new Date()
      } else {
        // If an unrecognized period is provided, fallback to query/default.
        startDate = req.query.dateFrom ? new Date(req.query.dateFrom) : defaultStartDate
        endDate = req.query.dateTo ? new Date(req.query.dateTo) : defaultEndDate
      }
    } else {
      // Use custom query parameters if provided; otherwise, use the default range.
      startDate = req.query.dateFrom ? new Date(req.query.dateFrom) : defaultStartDate
      endDate = req.query.dateTo ? new Date(req.query.dateTo) : defaultEndDate
    }

    // Find Price records for the given region within the determined date range.
    const prices = await Price.find({
      region,
      createdAt: { $gte: startDate, $lte: endDate },
    })

    if (!prices.length) {
      return res.json({ message: `No prices found for region: ${region}` })
    }

    let minPrice = Infinity
    let maxPrice = -Infinity
    let total = 0
    let count = 0
    let priceValues = []

    prices.forEach((price) => {
      const min = price.minimumPrice
      const max = price.maximumPrice

      if (min < minPrice) minPrice = min
      if (max > maxPrice) maxPrice = max

      total += min + max
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
      mode: Math.round(convertUnit(mode, unit) * 100) / 100,
    })
  } catch (err) {
    res
      .status(422)
      .json({ message: 'Error retrieving summary: ' + err.message })
  }
})

router.post('/register-price', authenticateToken, async (req, res) => {
  try {
    const { transaction, product, messenger, measure, createdAt } = req.body

    if (!transaction) {
      return res
        .status(400)
        .json({ message: "Campo 'transaction' é obrigatório." })
    }

    if (!product) {
      return res.status(400).json({ message: "Campo 'product' é obrigatório." })
    }

    if (!messenger) {
      return res
        .status(400)
        .json({ message: "Campo 'messenger' é obrigatório." })
    }

    const newPrice = new Price()
    newPrice.transaction = transaction
    newPrice.product = product
    newPrice.messenger = messenger
    newPrice.measure = measure
    newPrice.createdAt = createdAt ? new Date(createdAt) : new Date()

    // Atribuição de campos comuns
    newPrice.currency = req.body.currency || 'BRL'
    newPrice.country = req.body.country || 'BR'
    newPrice.uf = req.body.uf
    newPrice.city = req.body.city
    newPrice.organization = req.body.organization
    newPrice.region = req.body.region
    newPrice.buyerPositionSeller = req.body.buyerPositionSeller
    newPrice.buyerPositionBuyer = req.body.buyerPositionBuyer

    if (transaction === 'oferta de preços') {
      const { originalMinimumPrice, originalMaximumPrice } = req.body
      if (
        originalMinimumPrice === undefined ||
        originalMaximumPrice === undefined
      ) {
        return res
          .status(400)
          .json({
            message:
              "Para 'oferta de preços', os campos 'originalMinimumPrice' e 'originalMaximumPrice' são obrigatórios.",
          })
      }
      // Converter para número mesmo que enviado como string
      newPrice.originalMinimumPrice = Number(originalMinimumPrice)
      newPrice.originalMaximumPrice = Number(originalMaximumPrice)
      // Em uma oferta de preços não há quantidade transacionada
      newPrice.transactedQuantity = 0
    } else if (transaction === 'preço da venda') {
      const { originalPrice, transactedQuantity } = req.body
      if (originalPrice === undefined || transactedQuantity === undefined) {
        return res
          .status(400)
          .json({
            message:
              "Para 'preço da venda', os campos 'originalPrice' e 'transactedQuantity' são obrigatórios.",
          })
      }
      // Converter os valores recebidos para número, mesmo que enviados como string
      newPrice.originalPrice = Number(originalPrice)
      newPrice.originalMaximumPrice = Number(originalPrice)
      newPrice.originalMinimumPrice = Number(originalPrice)
      newPrice.transactedQuantity = Number(transactedQuantity)
    } else {
      return res
        .status(400)
        .json({ message: "Valor de 'transaction' inválido." })
    }

    await newPrice.save()
    return res
      .status(201)
      .json({ message: 'Preço registrado com sucesso', price: newPrice })
  } catch (err) {
    return res
      .status(422)
      .json({ message: 'Erro ao registrar preço: ' + err.message })
  }
})

router.get('/mean-prices-by-region/:region', authenticateToken, async (req, res) => {
  try {
    const userRegion = req.params.region;
    const unit = req.query.unitOfMeasurement || 'Kg';

    // Define default date range
    const currentYear = new Date().getFullYear();
    const defaultStartDate = new Date(currentYear - 1, 9, 1); // October 1 of last year
    const defaultEndDate = new Date(currentYear, 8, 30); // September 30 of current year

    let startDate, endDate;
    if (req.query.period) {
      if (req.query.period === 'Semana') {
        // Last 7 days
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date();
      } else if (req.query.period === 'Mes') {
        // Last 30 days
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date();
      } else {
        // Unrecognized period: fallback to explicit dates if provided or defaults.
        startDate = req.query.dateFrom ? new Date(req.query.dateFrom) : defaultStartDate;
        endDate = req.query.dateTo ? new Date(req.query.dateTo) : defaultEndDate;
      }
    } else {
      // Use explicit dates provided in the query (if any); otherwise, use defaults.
      startDate = req.query.dateFrom ? new Date(req.query.dateFrom) : defaultStartDate;
      endDate = req.query.dateTo ? new Date(req.query.dateTo) : defaultEndDate;
    }

    const pipeline = [
      // Filter by the createdAt date based on the computed startDate and endDate.
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate } 
        } 
      },
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
      {
        $group: {
          _id: '$region',
          totalMinimumPrice: { $sum: '$minimumPrice' },
          totalMaximumPrice: { $sum: '$maximumPrice' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          averagePrice: {
            $divide: [
              { $add: ['$totalMinimumPrice', '$totalMaximumPrice'] },
              { $multiply: ['$count', 2] }
            ]
          },
        },
      },
      { $sort: { averagePrice: -1 } },
    ];

    const prices = await Price.aggregate(pipeline);

    if (!prices.length) {
      return res.status(404).json({ message: 'No prices found for any region.' });
    }

    let resultString = '';
    prices.forEach(price => {
      const regionName = price._id;
      const averagePrice = price.averagePrice;
      const convertedAveragePrice = convertUnit(averagePrice, unit);
      const formattedPrice = `R$ ${Number(convertedAveragePrice).toFixed(2)}`;

      if (regionName === userRegion) {
        resultString += `**${regionName}: ${formattedPrice}**\n`;
      } else {
        resultString += `${regionName}: ${formattedPrice}\n`;
      }
    });

    res.send(resultString);
  } catch (err) {
    res.status(422).json({ message: 'Error fetching mean prices: ' + err.message });
  }
});

module.exports = router
