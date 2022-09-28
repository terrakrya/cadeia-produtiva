const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const sendMail = require('../config/mail').sendMail
const populate = require('../config/utils').populate
const User = mongoose.model('User')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  } else {
    query.username = { $ne: 'admin' }
  }

  if (filters.role) {
    query.role = filters.role
  }

  try {
    // ***** executa a query *****

    const users = await User.find(query).populate(populate(req)).sort('name')

    res.json(users)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de usuários: ' + err.message)
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    const user = await User.findOne(query).populate(populate(req))
    return res.json(user)
  } catch (err) {
    res.sendStatus(422)
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
    res.sendStatus(422)
  }
})

router.post('/unique-cpf', auth.authenticated, async (req, res) => {
  const query = { cpf: req.body.cpf }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await User.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/unique-username', auth.authenticated, async (req, res) => {
  const query = { username: req.body.username }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await User.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/', auth.authenticated, async (req, res) => {
  try {
    const user = new User()

    user.username = req.body.username
    user.email = req.body.email
    user.name = req.body.name
    user.role = req.body.role
    user.cpf = req.body.cpf

    if (req.body.password) {
      user.setPassword(req.body.password)
    } else {
      user.setPassword('MUDESUASENHA')
    }

    await user.save()

    return res.send(user)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao incluir o usuário: ' + err.message)
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
      user.role = req.body.role
      user.cpf = req.body.cpf

      if (req.body.password) {
        user.setPassword(req.body.password)
      }

      await user.save()

      return res.send(user)
    } else {
      res.status(422).send('Usuário não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao atualizar o usuário: ' + err.message)
  }
})

router.put('/:id/profile', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const user = await User.findOne(query)

    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.username = req.body.username || user.username
      user.cpf = req.body.cpf || user.cpf

      if (req.body.password) {
        user.setPassword(req.body.password)
      }

      await user.save()

      return res.send(user)
    } else {
      res.status(422).send('Usuário não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao atualizar o usuário: ' + err.message)
  }
})

router.delete('/:id', auth.authenticated, (req, res) => {
  const query = { _id: req.params.id }

  User.findOne(query).exec(function (err, user) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir o usuário: ' + err.message)
    } else if (req.user.id === req.params.id) {
      res.status(422).send('Não é possível excluir você mesmo')
    } else {
      user.remove()
      res.send(user)
    }
  })
})

router.post('/forgot-password', async (req, res) => {
  try {
    const query = { username: req.body.username }

    const user = await User.findOne(query)

    if (user) {
      const link = 'test' // TODO: montar a URL para a página
      const text =
        '<p>Olá,</p>' +
        `<p>Segue o link para redefinição da sua senha: ${link}</p>`

      sendMail(user.email, 'Redefinição de senha', text)

      return res.send(true)
    } else {
      res.status(422).send('Usuário não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao redefinir a senha do usuário: ' + err.message)
  }
})

module.exports = router
