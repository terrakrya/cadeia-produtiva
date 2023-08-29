const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const GeographicArea = mongoose.model('GeographicArea')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  try {
    // ***** executa a query *****

    const geographic = await GeographicArea.find(query)
      .populate(populate(req))
      .sort('code')

    res.json(geographic)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de áreas geográficas: ' + err.message)
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const geographic = await GeographicArea.findOne(query).populate(populate(req))
    return res.json(geographic)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const geographic = new GeographicArea()

    geographic.uf = req.body.uf
    geographic.county = req.body.county
    geographic.square = req.body.square
    geographic.squareid = req.body.squareid
    geographic.polygon = req.body.polygon
    geographic.name = req.body.name
    geographic.comments = req.body.comments
    geographic.file = req.body.file

    await geographic.save()

    return res.send(geographic)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao incluir a áreas geográficas: ' + err.message)
  }
})
// altera um produto
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const geographic = await GeographicArea.findOne(query)

    if (geographic) {
      geographic.uf = req.body.uf
      geographic.county = req.body.county
      geographic.square = req.body.square
      geographic.squareid = req.body.squareid
      geographic.polygon = req.body.polygon
      geographic.name = req.body.name
      geographic.comments = req.body.comments
      geographic.file = req.body.file

      await geographic.save()

      return res.send(geographic)
    } else {
      res.status(422).send('Áreas geográficas não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao atualizar a áreas geográficas: ' + err.message)
  }
})

router.delete('/:id', auth.authenticated, (req, res) => {
  const query = { _id: req.params.id }

  GeographicArea.findOne(query).exec(function (err, geographic) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir a áreas geográficas: ' + err.message)
    } else {
      geographic.remove()
      res.send(geographic)
    }
  })
})

module.exports = router
