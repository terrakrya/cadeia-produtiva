const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Product = mongoose.model('Product')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.code) {
    query.code = filters.code
  }

  if (filters.description) {
    query.description = filters.description
  }

  try {
    // ***** executa a query *****

    const product = await Product.find(query)
      .populate(populate(req))
      .sort('name')

    res.json(product)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de produto: ' + err.message)
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const product = await Product.findOne(query).populate(populate(req))
    return res.json(product)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/unique-codigo', auth.authenticated, async (req, res) => {
  const query = { code: req.body.code }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await Product.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const product = new Product()

    product.code = req.body.code
    product.description = req.body.description

    await product.save()

    return res.send(product)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao incluir o produto: ' + err.message)
  }
})

router.delete('/:id', auth.authenticated, (req, res) => {
  const query = { _id: req.params.id }

  Product.findOne(query).exec(function (err, product) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir o produto: ' + err.message)
    } else {
      product.remove()
      res.send(product)
    }
  })
})

module.exports = router
