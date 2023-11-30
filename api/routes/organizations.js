const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const Organization = mongoose.model('Organization')

router.get('/', auth.manager, async (req, res) => {
  const query = {}

  try {
    // ***** executa a query *****

    const organizations = await Organization.find(query)
      .populate('product')
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

router.get('/:id', auth.globalManager, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const organizations = await Organization.findOne(query).populate('products')
    return res.json(organizations)
  } catch (err) {
    res.sendStatus(422)
  }
})
router.get('/edit/:id', auth.globalManager, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const organizations = await Organization.findOne(query).populate('product')
    return res.json(organizations)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.manager, async (req, res) => {
  try {
    const organizations = new Organization()

    organizations.name = req.body.name
    organizations.type = req.body.type
    organizations.cnpj = req.body.cnpj
    organizations.address = req.body.address
    organizations.territory = req.body.territory
    organizations.contact = req.body.contact
    organizations.chainLink = req.body.chainLink
    organizations.square = req.body.square
    organizations.squareid = req.body.squareid
    organizations.uf = req.body.uf
    organizations.county = req.body.county
    organizations.members = req.body.members
    organizations.products = req.body.products
    organizations.bestPractices = req.body.bestPractices
    organizations.certifications = req.body.certifications
    organizations.comments = req.body.comments
    organizations.email = req.body.email
    organizations.sigla = req.body.sigla
    organizations.otherContacts = req.body.otherContacts
    organizations.acting = req.body.acting
    organizations.socialNetwork = req.body.socialNetwork
    organizations.site = req.body.site
    await organizations.save()

    return res.send(organizations)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao incluir a organização: ' + err.message)
  }
})
// altera um produto
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const organizations = await Organization.findOne(query)

    if (organizations) {
      organizations.name = req.body.name
      organizations.type = req.body.type
      organizations.cnpj = req.body.cnpj
      organizations.address = req.body.address
      organizations.territory = req.body.territory
      organizations.contact = req.body.contact
      organizations.chainLink = req.body.chainLink
      organizations.square = req.body.square
      organizations.squareid = req.body.squareid
      organizations.uf = req.body.uf
      organizations.county = req.body.county
      organizations.members = req.body.members
      organizations.products = req.body.products
      organizations.bestPractices = req.body.bestPractices
      organizations.certifications = req.body.certifications
      organizations.comments = req.body.comments
      organizations.email = req.body.email
      organizations.sigla = req.body.sigla
      organizations.otherContacts = req.body.otherContacts
      organizations.acting = req.body.acting
      organizations.socialNetwork = req.body.socialNetwork
      organizations.site = req.body.site
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

router.delete('/:id', auth.globalManager, (req, res) => {
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
