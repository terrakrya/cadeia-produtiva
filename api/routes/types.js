const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Type = mongoose.model('Type')

router.get('/', auth.manager, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.name) {
    query.name = filters.name
  }

  if (filters.type) {
    query.type = filters.type
  }

  try {
    // ***** executa a query *****

    const type = await Type.find(query).populate(populate(req)).sort('code')

    res.json(type)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de tipos: ' + err.message)
  }
})

router.get('/:id', auth.globalManager, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const type = await Type.findOne(query).populate(populate(req))
    return res.json(type)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/unique-code', auth.globalManager, async (req, res) => {
  const query = { code: req.body.code }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await Type.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})
router.post('/unique-name', auth.globalManager, async (req, res) => {
  const query = { name: req.body.name }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await Type.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.globalManager, async (req, res) => {
  try {
    const type = new Type()

    type.name = req.body.name
    type.code = req.body.code
    type.description = req.body.description
    type.type = req.body.type

    await type.save()

    return res.send(type)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao incluir o tipo: ' + err.message)
  }
})
// altera um produto
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const type = await Type.findOne(query)

    if (type) {
      type.name = req.body.name
      type.code = req.body.code
      type.description = req.body.description
      type.type = req.body.type

      await type.save()

      return res.send(type)
    } else {
      res.status(422).send('tipo não encontrado')
    }
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao atualizar o tipo: ' + err.message)
  }
})

router.delete('/:id', auth.globalManager, (req, res) => {
  const query = { _id: req.params.id }

  Type.findOne(query).exec(function (err, type) {
    if (err) {
      res.status(422).send('Ocorreu um erro ao excluir o tipo: ' + err.message)
    } else {
      type.remove()
      res.send(type)
    }
  })
})

module.exports = router
