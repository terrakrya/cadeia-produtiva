const mongoose = require('mongoose')
const router = require('express').Router()
const authenticateToken = require('../config/api-auth')
const User = mongoose.model('User')
const Price = mongoose.model('PriceInformation')
const convertUnit = require('../utils/convertUnit')
const getModa = require('../utils/moda')

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: External service endpoints for integration
 */

/**
 * @swagger
 * /services/user-by-phone/{cellphone}:
 *   get:
 *     summary: Find a user by phone number
 *     description: Retrieves user information by matching the last 8 digits of their phone number
 *     tags: [Services]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: cellphone
 *         required: true
 *         description: User's phone number
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 cellphone:
 *                   type: string
 *                 organization:
 *                   type: object
 *       400:
 *         description: Phone number is required
 *       404:
 *         description: User not found
 *       422:
 *         description: Error searching for user
 */
router.get('/user-by-phone/:cellphone', authenticateToken, async (req, res) => {
  try {
    if (!req.params.cellphone) {
      return res
        .status(400)
        .json({ message: 'Número de telefone é obrigatório' })
    }

    // Remove all non-digit characters from the provided phone number.
    const cleanPhone = req.params.cellphone.replace(/\D/g, '')
    // Extract the last 8 digits.
    const lastEightDigits = cleanPhone.slice(-8)

    // Find a user whose stored cellphone ends with the last 8 digits.
    const user = await User.findOne({
      cellphone: { $regex: lastEightDigits + '$' },
    })
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

/**
 * @swagger
 * /services/prices-by-region/{region}:
 *   get:
 *     summary: Get prices by region
 *     description: Retrieves all price information for a specific region
 *     tags: [Services]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         description: Region identifier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of prices for the specified region
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   price:
 *                     type: number
 *                   minimumPrice:
 *                     type: number
 *                   maximumPrice:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   product:
 *                     type: object
 *                   messengerDetails:
 *                     type: object
 *       422:
 *         description: Error fetching prices
 */
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

/**
 * @swagger
 * /services/prices-summary/{region}:
 *   get:
 *     summary: Get prices summary for a region
 *     description: Retrieves a summary of prices for a region based on a date range or period filter.
 *     tags: [Services]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Region identifier.
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [Semana, Mes]
 *         description: Predefined period filter (e.g., 'Semana' for last 7 days, 'Mes' for last 30 days).
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for a custom date range.
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for a custom date range.
 *       - in: query
 *         name: unitOfMeasurement
 *         schema:
 *           type: string
 *         description: Unit of measurement (default is 'Kg').
 *     responses:
 *       200:
 *         description: Price summary for the specified region.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInputs:
 *                   type: integer
 *                 minimumPrice:
 *                   type: number
 *                 maximumPrice:
 *                   type: number
 *                 averagePrice:
 *                   type: number
 *                 mode:
 *                   type: number
 *       422:
 *         description: Error retrieving price summary.
 */

router.get('/prices-summary/:region', authenticateToken, async (req, res) => {
  try {
    const region = req.params.region
    const currentYear = new Date().getFullYear()
    const defaultStartDate = new Date(currentYear - 1, 9, 1) // October 1st of last year
    const defaultEndDate = new Date(currentYear, 8, 30) // September 30th of current year

    let startDate, endDate

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
        startDate = req.query.dateFrom
          ? new Date(req.query.dateFrom)
          : defaultStartDate
        endDate = req.query.dateTo ? new Date(req.query.dateTo) : defaultEndDate
      }
    } else {
      // Use custom query parameters if provided; otherwise, use the default range.
      startDate = req.query.dateFrom
        ? new Date(req.query.dateFrom)
        : defaultStartDate
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

/**
 * @swagger
 * /services/register-price:
 *   post:
 *     summary: Register a new price record
 *     description: Creates a new price record with details such as transaction type, product, messenger, and pricing information.
 *     tags: [Services]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Price record object that needs to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction:
 *                 type: string
 *               product:
 *                 type: string
 *               messenger:
 *                 type: string
 *               measure:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               originalMinimumPrice:
 *                 type: number
 *               originalMaximumPrice:
 *                 type: number
 *               originalPrice:
 *                 type: number
 *               transactedQuantity:
 *                 type: number
 *               uf:
 *                 type: string
 *               city:
 *                 type: string
 *               organization:
 *                 type: string
 *               region:
 *                 type: string
 *               buyerPositionSeller:
 *                 type: string
 *               buyerPositionBuyer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Price record registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 price:
 *                   type: object
 *       400:
 *         description: Missing required fields or invalid transaction type.
 *       422:
 *         description: Error registering price.
 */

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
    newPrice.currency = req.body.currency || 'real'
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
        return res.status(400).json({
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
        return res.status(400).json({
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

/**
 * @swagger
 * /services/mean-prices-by-region/{region}:
 *   get:
 *     summary: Get average prices by region
 *     description: Retrieves the average price data for a specific region, with optional filtering for a date range or period.
 *     tags: [Services]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Region identifier.
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [Semana, Mes]
 *         description: Predefined period filter (e.g., 'Semana' or 'Mes').
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for a custom date range.
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for a custom date range.
 *       - in: query
 *         name: unitOfMeasurement
 *         schema:
 *           type: string
 *         description: Unit of measurement (default is 'Kg').
 *     responses:
 *       200:
 *         description: Retrieved mean prices for the specified region.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   region:
 *                     type: string
 *                   averagePrice:
 *                     type: number
 *       404:
 *         description: No prices found for any region.
 *       422:
 *         description: Error retrieving average prices.
 */

router.get(
  '/mean-prices-by-region/:region',
  authenticateToken,
  async (req, res) => {
    try {
      const userRegion = req.params.region
      const unit = req.query.unitOfMeasurement || 'Kg'

      // Define default date range
      const currentYear = new Date().getFullYear()
      const defaultStartDate = new Date(currentYear - 1, 9, 1) // October 1st of last year
      const defaultEndDate = new Date(currentYear, 8, 30) // September 30th of current year

      let startDate, endDate
      if (req.query.period) {
        if (req.query.period === 'Semana') {
          // Last 7 days
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          endDate = new Date()
        } else if (req.query.period === 'Mes') {
          // Last 30 days
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          endDate = new Date()
        } else {
          // Unrecognized period: fallback to explicit dates if provided or defaults.
          startDate = req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : defaultStartDate
          endDate = req.query.dateTo
            ? new Date(req.query.dateTo)
            : defaultEndDate
        }
      } else {
        // Use explicit dates provided in the query (if any); otherwise, use defaults.
        startDate = req.query.dateFrom
          ? new Date(req.query.dateFrom)
          : defaultStartDate
        endDate = req.query.dateTo ? new Date(req.query.dateTo) : defaultEndDate
      }

      const pipeline = [
        // Filter by the createdAt date based on the computed startDate and endDate.
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
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
                { $multiply: ['$count', 2] },
              ],
            },
          },
        },
        { $sort: { averagePrice: -1 } },
      ]

      const prices = await Price.aggregate(pipeline)

      if (!prices.length) {
        return res
          .status(404)
          .json({ message: 'No prices found for any region.' })
      }

      const regionsSummary = prices.map((price) => {
        const regionName = price._id
        const averagePrice = price.averagePrice
        // Convert unit and format the value
        const convertedAveragePrice = convertUnit(averagePrice, unit)
        return {
          region: regionName,
          averagePrice: Number(convertedAveragePrice).toFixed(2),
          formattedPrice: `R$ ${Number(convertedAveragePrice).toFixed(2)}`,
          isUsersRegion: regionName === userRegion,
        }
      })

      res.json({ regions: regionsSummary })
    } catch (err) {
      res
        .status(422)
        .json({ message: 'Error fetching mean prices: ' + err.message })
    }
  }
)

/**
 * @swagger
 * /services/user-price-ranking/{cellphone}:
 *   get:
 *     summary: Get user price ranking
 *     description: Retrieves a user's ranking based on the number of prices reported
 *     tags: [Services]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: cellphone
 *         required: true
 *         description: User's phone number
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User ranking information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 priceCount:
 *                   type: integer
 *                 additionalNeeded:
 *                   type: integer
 *                 ranking:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *       400:
 *         description: Phone number is required
 *       404:
 *         description: User not found
 *       422:
 *         description: Error calculating ranking
 */
router.get(
  '/user-price-ranking/:cellphone',
  authenticateToken,
  async (req, res) => {
    try {
      const cellphone = req.params.cellphone
      if (!cellphone) {
        return res
          .status(400)
          .json({ message: 'Número de telefone é obrigatório.' })
      }

      // Remove all non-digit characters from the provided phone number.
      const cleanPhone = cellphone.replace(/\D/g, '')
      // Extract the last 8 digits.
      const lastEightDigits = cleanPhone.slice(-8)

      // Find a user whose stored cellphone ends with the last 8 digits.
      const user = await User.findOne({
        cellphone: { $regex: lastEightDigits + '$' },
      })
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' })
      }

      // Define o intervalo da safra:
      // de 1º de outubro do ano anterior até 30 de setembro do ano atual
      const currentYear = new Date().getFullYear()
      const startDate = new Date(currentYear - 1, 9, 1) // 1º de outubro do ano anterior
      const endDate = new Date(currentYear, 8, 30) // 30 de setembro do ano atual

      // Agregamos os preços informados na safra, agrupando por mensageiro
      const pipeline = [
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$messenger', priceCount: { $sum: 1 } } },
      ]
      const aggregated = await Price.aggregate(pipeline)

      // Verifica quantos preços o usuário informado possui (se não possuir, considera 0)
      const userData = aggregated.find(
        (item) => item._id.toString() === user._id.toString()
      )
      const userPriceCount = userData ? userData.priceCount : 0

      // Calcula o ranking do usuário:
      // Ranking é determinado pelo número de usuários com contagem superior + 1.
      const ranking =
        aggregated.filter((item) => item.priceCount > userPriceCount).length + 1

      // Calcula quantos preços faltam para ultrapassar o próximo usuário de ranking:
      // Filtra os usuários que possuem mais preços que o usuário consultado e obtém o menor desses valores.
      const higherCounts = aggregated
        .filter((item) => item.priceCount > userPriceCount)
        .map((item) => item.priceCount)

      let additionalNeeded = 0
      if (higherCounts.length > 0) {
        // Se o usuário logo acima reportou, por exemplo, 11 preços, o usuário precisa atingir 12.
        const nextHigher = Math.min(...higherCounts)
        additionalNeeded = nextHigher + 1 - userPriceCount
      }

      // Total de usuários com preços informados no período
      const totalUsers = aggregated.length

      return res.json({
        name: user.name,
        priceCount: userPriceCount,
        additionalNeeded,
        ranking,
        totalUsers,
      })
    } catch (err) {
      return res.status(422).json({
        message: 'Erro ao calcular o avanço no ranking: ' + err.message,
      })
    }
  }
)

module.exports = router
