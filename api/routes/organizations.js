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

  if (filters.organizations) {
    query.organizations = filters.organizations
  }

  if (filters.types) {
    query.types = filters.types
  }

  try {
    // ***** executa a query *****

    const organizations = await Organization.find(query)
      .populate(populate(req))
      .sort('name')

    res.json(organizations)
  } catch (err) {
    res
      .status(422)
      .send(
        'Ocorreu um erro ao carregar a lista de organizações: ' + err.message
      )
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const organizations = await Organization.findOne(query).populate(
      populate(req)
    )
    return res.json(organizations)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const organizations = new Organization()

    organizations.name = req.body.name
    organizations.type = req.body.type
    organizations.cnpj = req.body.cnpj
    organizations.address = req.body.address
    organizations.occupationArea = req.body.occupationArea
    organizations.contact = req.body.contact
    organizations.chainLink = req.body.chainLink
    organizations.region = req.body.region
    organizations.uf = req.body.uf
    organizations.city = req.body.city
    organizations.members = req.body.members
    organizations.products = req.body.products
    organizations.bestPractices = req.body.bestPractices
    organizations.certifications = req.body.certifications

    await organizations.save()

    return res.send(organizations)
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

    const organizations = await Organization.findOne(query)

    if (organizations) {
      organizations.name = req.body.name
      organizations.type = req.body.type
      organizations.cnpj = req.body.cnpj
      organizations.address = req.body.address
      organizations.occupationArea = req.body.occupationArea
      organizations.contact = req.body.contact
      organizations.chainLink = req.body.chainLink
      organizations.region = req.body.region
      organizations.uf = req.body.uf
      organizations.city = req.body.city
      organizations.members = req.body.members
      organizations.products = req.body.products
      organizations.bestPractices = req.body.bestPractices
      organizations.certifications = req.body.certifications
      await organizations.save()

      return res.send(organizations)
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

  Organization.findOne(query).exec(function (err, organizations) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir a organização: ' + err.message)
    } else {
      organizations.remove()
      res.send(organizations)
    }
  })
})

module.exports = router
