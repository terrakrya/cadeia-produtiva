const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const SpeciesProduct = mongoose.model('SpeciesProduct')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.name) {
    query.name = filters.name
  }

  if (filters.specie) {
    query.specie = filters.specie
  }

  try {
    // ***** executa a query *****

    const speciesProducts = await SpeciesProduct.find(query)
      .populate('specie')
      .sort('name')

    res.json(speciesProducts)
  } catch (err) {
    res
      .status(422)
      .send(
        'Ocorreu um erro ao carregar a lista de espécies/produtos: ' +
          err.message
      )
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const speciesProducts = await SpeciesProduct.findOne(query).populate(
      populate(req)
    )
    return res.json(speciesProducts)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/unique-name', auth.authenticated, async (req, res) => {
  const query = { name: req.body.name }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await SpeciesProduct.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const speciesProducts = new SpeciesProduct()

    speciesProducts.name = req.body.name
    speciesProducts.industrialized = req.body.industrialized
    speciesProducts.class = req.body.class
    speciesProducts.group = req.body.group
    speciesProducts.specie = req.body.specie
    speciesProducts.description = req.body.description
    speciesProducts.type = req.body.type
    speciesProducts.image = req.body.image

    await speciesProducts.save()

    return res.send(speciesProducts)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao incluir o espécies/produtos: ' + err.message)
  }
})
// altera um produto
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const speciesProducts = await SpeciesProduct.findOne(query)

    if (speciesProducts) {
      speciesProducts.name = req.body.name
      speciesProducts.industrialized = req.body.industrialized
      speciesProducts.class = req.body.class
      speciesProducts.group = req.body.group
      speciesProducts.specie = req.body.specie
      speciesProducts.description = req.body.description
      speciesProducts.type = req.body.type
      speciesProducts.image = req.body.image

      await speciesProducts.save()

      return res.send(speciesProducts)
    } else {
      res.status(422).send('tipo não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao atualizar o espécies/produtos: ' + err.message)
  }
})

router.delete('/:id', auth.authenticated, (req, res) => {
  const query = { _id: req.params.id }

  SpeciesProduct.findOne(query).exec(function (err, speciesProducts) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir o espécies/produtos: ' + err.message)
    } else {
      speciesProducts.remove()
      res.send(speciesProducts)
    }
  })
})

module.exports = router
