const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Category = mongoose.model('Category')

router.get('/', auth.globalManager, async (req, res) => {
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

    const category = await Category.find(query)
      .populate(populate(req))
      .sort('code')

    res.json(category)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de categorias: ' + err.message)
  }
})

router.get('/:id', auth.globalManager, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const category = await Category.findOne(query).populate(populate(req))
    return res.json(category)
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
    const found = await Category.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.globalManager, async (req, res) => {
  try {
    const category = new Category()

    category.code = req.body.code
    category.description = req.body.description

    await category.save()

    return res.send(category)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao incluir a categoria: ' + err.message)
  }
})
// altera um produto
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const category = await Category.findOne(query)

    if (category) {
      category.code = req.body.code
      category.description = req.body.description

      await category.save()

      return res.send(category)
    } else {
      res.status(422).send('categoria não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao atualizar o categoria: ' + err.message)
  }
})

router.delete('/:id', auth.globalManager, (req, res) => {
  const query = { _id: req.params.id }

  Category.findOne(query).exec(function (err, category) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir a categoria: ' + err.message)
    } else {
      category.remove()
      res.send(category)
    }
  })
})

module.exports = router
