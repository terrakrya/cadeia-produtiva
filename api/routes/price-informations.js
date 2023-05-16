const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Price = mongoose.model('PriceInformation')
const ObjectId = mongoose.Types.ObjectId

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****


  try {
    // ***** executa a query *****

    const price = await Price.find(query)
      .populate('product')
      .populate('messenger')
      .sort('price')

    res.json(price)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de preço: ' + err.message)
  }
})

router.get('/data-published', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  // TODO: filtrar pelo usuário logado (quando está logado no sistema) ou sem usuário (quando está fora)

  if (req.query.filters) {
    const filters = JSON.parse(req.query.filters || '{}')
    
    if (filters.product) {
      query.product = ObjectId(filters.product)
    }

    if (filters.uf) {
      query.uf = filters.uf
    }

    if (filters.city) {
      query.city = filters.city
    }
    
    if (filters.from && !filters.to) {
      query.createdAt = {
        $gte: new Date(filters.from),
      }
    } else if (filters.to && !filters.from) {
      query.createdAt = {
        $lte: new Date(filters.to),
      }
    } else if (filters.from && filters.to) {
      query.createdAt = {
        $gte: new Date(filters.from),
        $lte: new Date(filters.to),
      }
    }

    
  }

  try {
    // ***** executa a query *****

    const priceListAgr = await Price.aggregate(
      [
        { "$match": query },
        { "$sort": { 'createdAt': -1 } },
        {
          "$lookup": {
            from: "users",
            localField: "messenger",
            foreignField: "_id",
            as: "from"
          }
        },
        {
          "$group": {
            _id: {
              "date": { "$dateToString": { format: "%d/%m/%Y", date: "$createdAt" } },
              "from": "$from.buyerPosition",
              "to": "$buyerPosition"
            },
            minimumPrice: { "$min": "$minimumPrice" },
            maximumPrice: { "$max": "$maximumPrice" }
          }
        }
      ]
    )

    const priceList = priceListAgr.map(function (obj) {
      return {
        date: obj._id.date,
        from: obj._id.from.length ? obj._id.from[0] : "",
        to: obj._id.to,
        minimumPrice: obj.minimumPrice,
        maximumPrice: obj.maximumPrice,
        averagePrice: (obj.minimumPrice + obj.maximumPrice) / 2
      }
    })

    res.json(priceList)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de preço: ' + err.message)
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const price = await Price.findOne(query).populate(populate(req))
    return res.json(price)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const price = new Price()

    price.createdAt = req.body.createdAt
    price.buyerPositionBuyer = req.body.buyerPositionBuyer
    price.minimumPrice = req.body.minimumPrice
    price.maximumPrice = req.body.maximumPrice
    price.originalMinimumPrice = req.body.originalMinimumPrice
    price.originalMaximumPrice = req.body.originalMaximumPrice
    price.currency = req.body.currency
    price.country = req.body.country
    price.measure = req.body.measure
    price.product = req.body.product
    price.messenger = req.body.messenger
    price.uf = req.body.uf
    price.city = req.body.city
    price.organization = req.body.organization
    price.transaction = req.body.transaction
    price.transactedQuantity = req.body.transactedQuantity
    price.buyerPositionSeller = req.body.buyerPositionSeller

    await price.save()

    return res.send(price)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao incluir o preço: ' + err.message)
  }
})

// altera um produto
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const price = await Price.findOne(query)

    if (price) {
      price.createdAt = req.body.createdAt
      price.buyerPositionBuyer = req.body.buyerPositionBuyer
      price.minimumPrice = req.body.minimumPrice
      price.maximumPrice = req.body.maximumPrice
      price.originalMinimumPrice = req.body.originalMinimumPrice
      price.originalMaximumPrice = req.body.originalMaximumPrice
      price.currency = req.body.currency
      price.country = req.body.country
      price.measure = req.body.measure
      price.product = req.body.product
      price.messenger = req.body.messenger
      price.uf = req.body.uf
      price.city = req.body.city
      price.transaction = req.body.transaction
      price.transactedQuantity = req.body.transactedQuantity
      price.buyerPositionSeller = req.body.buyerPositionSeller

      await price.save()

      return res.send(price)
    } else {
      res.status(422).send('Preço não encontrado')
    }
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao atualizar o preço: ' + err.message)
  }
})

router.delete('/:id', auth.authenticated, (req, res) => {
  const query = { _id: req.params.id }

  Price.findOne(query).exec(function (err, price) {
    if (err) {
      res.status(422).send('Ocorreu um erro ao excluir o preço: ' + err.message)
    } else {
      price.remove()
      res.send(price)
    }
  })
})

module.exports = router
