const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Organization = mongoose.model('Organization')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.organization) {
    query.organization = filters.organization
  }

  if (filters.type) {
    query.type = filters.type
  }

  try {
    // ***** executa a query *****

    const organization = await Organization.find(query)
      .populate(populate(req))
      .sort('name')

    res.json(organization)
  } catch (err) {
    res
      .status(422)
      .send(
        'Ocorreu um erro ao carregar a lista de organização: ' + err.message
      )
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const organization = await Organization.findOne(query).populate(
      populate(req)
    )
    return res.json(organization)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const organization = new Organization()

    organization.name = req.body.name
    organization.cnpj = req.body.cnpj
    organization.type = req.body.type
    organization.address = req.body.address
    organization.OccupationArea = req.body.OccupationArea
    organization.contact = req.body.contact
    organization.EloProdutiva = req.body.EloProdutiva
    organization.region = req.body.region
    organization.ProtectedArea = req.body.ProtectedArea
    organization.territory = req.body.territory
    organization.members = req.body.members
    organization.product = req.body.product
    organization.certification = req.body.certification
    organization.BoaPratica = req.body.BoaPratica

    await organization.save()

    return res.send(organization)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao incluir a organização: ' + err.message)
  }
})
// altera um produto
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const organization = await Organization.findOne(query)

    if (organization) {
      organization.name = req.body.name
      organization.cnpj = req.body.cnpj
      organization.type = req.body.type
      organization.address = req.body.address
      organization.OccupationArea = req.body.OccupationArea
      organization.contact = req.body.contact
      organization.EloProdutiva = req.body.EloProdutiva
      organization.region = req.body.region
      organization.ProtectedArea = req.body.ProtectedArea
      organization.territory = req.body.territory
      organization.members = req.body.members
      organization.product = req.body.product
      organization.certification = req.body.certification
      organization.BoaPratica = req.body.BoaPratica
      await organization.save()

      return res.send(organization)
    } else {
      res.status(422).send('organização não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao atualizar a organização: ' + err.message)
  }
})

router.delete('/:id', auth.authenticated, (req, res) => {
  const query = { _id: req.params.id }

  Organization.findOne(query).exec(function (err, organization) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir a organização: ' + err.message)
    } else {
      organization.remove()
      res.send(organization)
    }
  })
})

module.exports = router
