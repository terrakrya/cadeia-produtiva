const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Specie = mongoose.model('Specie')

router.get('/', auth.globalManager, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.scientificName) {
    query.scientificName = filters.scientificName
  }
  if (filters.popularName) {
    query.popularName = filters.popularName
  }

  try {
    // ***** executa a query *****

    const species = await Specie.find(query).populate(populate(req))

    res.json(species)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de espécies: ' + err.message)
  }
})

router.get('/:id', auth.globalManager, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const species = await Specie.findOne(query).populate(populate(req))
    return res.json(species)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.globalManager, async (req, res) => {
  try {
    const { scientificName, popularName } = req.body

    const newSpecie = new Specie({
      scientificName,
      popularName,
    })

    await newSpecie.save()
    return res.status(201).json(newSpecie)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao incluir o espécie: ' + err.message)
  }
})

router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const { scientificName, popularName } = req.body
    const { id } = req.params

    const updatedSpecie = await Specie.findByIdAndUpdate(
      id,
      { scientificName, popularName },
      { new: true, runValidators: true }
    )

    if (!updatedSpecie) {
      return res.status(404).json({ error: 'Espécie não encontrada' })
    }

    return res.json(updatedSpecie)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', auth.globalManager, async (req, res) => {
  try {
    const { id } = req.params
    const deletedSpecie = await Specie.findByIdAndDelete(id)

    if (!deletedSpecie) {
      return res.status(404).json({ error: 'Espécie não encontrada' })
    }

    return res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
