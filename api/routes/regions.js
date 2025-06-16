const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Region = mongoose.model('Region')

// Listar todas as regiões (com filtros)
router.get('/', auth.globalManager, async (req, res) => {
  const query = {}
  const { name, specie } = req.query

  if (name) {
    query.name = { $regex: name, $options: 'i' }
  }
  if (specie) {
    query.specie = specie
  }

  try {
    const regions = await Region.find(query).populate(populate(req))
    res.json(regions.map(region => region.data()))
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de regiões: ' + err.message)
  }
})

// Obter uma região por ID
router.get('/:id', auth.globalManager, async (req, res) => {
  try {
    const region = await Region.findById(req.params.id).populate(populate(req))
    if (!region) {
      return res.status(404).send('Região não encontrada.')
    }
    return res.json(region.data())
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao buscar a região: ' + err.message)
  }
})

// Criar uma nova região
router.post('/', auth.globalManager, async (req, res) => {
  try {
    const newRegion = new Region(req.body)
    await newRegion.save()
    res.status(201).json(newRegion.data())
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao criar a região: ' + err.message)
  }
})

// Atualizar uma região
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const updatedRegion = await Region.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedRegion) {
      return res.status(404).send('Região não encontrada.')
    }

    return res.json(updatedRegion.data())
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao atualizar a região: ' + err.message)
  }
})

// Deletar uma região
router.delete('/:id', auth.globalManager, async (req, res) => {
  try {
    const deletedRegion = await Region.findByIdAndDelete(req.params.id)

    if (!deletedRegion) {
      return res.status(404).send('Região não encontrada.')
    }

    return res.status(204).send()
  } catch (err) {
    res.status(400).send('Ocorreu um erro ao deletar a região: ' + err.message)
  }
})

module.exports = router 