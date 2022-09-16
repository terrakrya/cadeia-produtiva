const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const User = mongoose.model('User')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.role) {
    query.role = filters.role
  }

  try {
    // ***** executa a query *****

    const users = await User.find(query).populate(populate(req)).sort('name')

    res.json(users)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao carregar a lista: ' + err.message)
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const user = await User.findOne(query).populate(populate(req))
    return res.json(user)
  } catch (err) {
    res.sendStatus(401)
  }
})

router.post('/unique-email', auth.authenticated, async (req, res) => {
  const query = { email: req.body.email }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await User.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(401)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const user = new User()

    user.username = req.body.username
    user.email = req.body.email
    user.name = req.body.name
    user.nickname = req.body.nickname
    user.role = req.body.role

    if (req.body.password) {
      user.setPassword(req.body.password)
    } else {
      user.setPassword('MUDESUASENHA')
    }

    await user.save()

    return res.send(user)
  } catch (err) {
    res.sendStatus(401)
  }
})

router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const user = await User.findOne(query)

    if (user) {
      user.username = req.body.username
      user.email = req.body.email
      user.name = req.body.name
      user.nickname = req.body.nickname
      user.role = req.body.role

      if (req.body.password) {
        user.setPassword(req.body.password)
      }

      await user.save()

      return res.send(user)
    } else {
      res.sendStatus(401)
    }
  } catch (err) {
    res.sendStatus(401)
  }
})

router.delete('/:id', auth.authenticated, (req, res) => {
  const query = { _id: req.params.id }

  User.findOne(query).exec(function (err, user) {
    if (err) {
      res.status(422).send('Ocorreu um erro ao carregar o item: ' + err.message)
    } else if (req.user.id === req.params.id) {
      res.status(422).send('Não é possível excluír você mesmo!')
    } else {
      user.remove()
      res.send(user)
    }
  })
})

module.exports = router
