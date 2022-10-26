const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Specie = mongoose.model('Specie')

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

  if (filters.scientificName) {
    query.scientificName = filters.scientificName
  }
  if (filters.popularName) {
    query.popularName = filters.popularName
  }

  try {
    // ***** executa a query *****

    const species = await Specie.find(query)
      .populate(populate(req))
      .sort('code')

    res.json(species)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de espécies: ' + err.message)
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const species = await Specie.findOne(query).populate(populate(req))
    return res.json(species)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/unique-code', auth.authenticated, async (req, res) => {
  const query = { code: req.body.code }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await Specie.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const species = new Specie()

    species.code = req.body.code
    species.scientificName = req.body.scientificName
    species.description = req.body.description
    species.popularName = req.body.popularName
    species.images = req.body.images

    await species.save()

    return res.send(species)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao incluir o espécie: ' + err.message)
  }
})
// altera um produto
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const species = await Specie.findOne(query)

    if (species) {
      species.code = req.body.code
      species.scientificName = req.body.scientificName
      species.description = req.body.description
      species.popularName = req.body.popularName
      species.images = req.body.images

      await species.save()

      return res.send(species)
    } else {
      res.status(422).send('espécie não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao atualizar o espécie: ' + err.message)
  }
})

router.delete('/:id', auth.authenticated, (req, res) => {
  const query = { _id: req.params.id }

  Specie.findOne(query).exec(function (err, species) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir o espécie: ' + err.message)
    } else {
      species.remove()
      res.send(species)
    }
  })
})

module.exports = router
