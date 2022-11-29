const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Price = mongoose.model('PriceInformation')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.id) {
    query.product = filters.product
  }

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
    price.buyerPosition = req.body.buyerPosition
    price.price = req.body.price
    price.coin = req.body.coin
    price.country = req.body.country
    price.measure = req.body.measure
    price.product = req.body.product
    price.messenger = req.body.messenger
    price.uf = req.body.uf
    price.city = req.body.city

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
      price.buyerPosition = req.body.buyerPosition
      price.price = req.body.price
      price.coin = req.body.coin
      price.country = req.body.country
      price.measure = req.body.measure
      price.product = req.body.product
      price.messenger = req.body.messenger
      price.uf = req.body.uf
      price.city = req.body.city

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
