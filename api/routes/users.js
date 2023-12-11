const path = require('path')
const moment = require('moment')
const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const sendMail = require('../config/mail').sendMail
const populate = require('../config/utils').populate
const User = mongoose.model('User')

// recupera a lista de usuários
router.get('/', auth.authenticated, async (req, res) => {
  const query = {}
  const userRole = req.user.role

  try {
    // ***** executa a query *****

    if (userRole === 'mensageiro' && req.query.populate === 'network') {
      return res.status(403).json({
        status: 403,
        message:
          'A permissão de Gestor é necessária para acessar este recurso.',
      })
    }

    if (userRole === 'gestor') {
      query.organization = req.user.organization
    }
    const users = await User.find(query).populate('organization').sort('name')

    res.json(users)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de usuários: ' + err.message)
  }
})

// recupera um usuário
router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }
  const userRole = req.user.role
  const userId = req.user.id

  if (userRole === 'mensageiro') {
    query._id = userId
  }

  if (userRole === 'gestor') {
    query.organization = req.user.organization
  }

  try {
    const user = await User.findOne(query).populate(populate(req))

    return res.json(user)
  } catch (err) {
    res.sendStatus(422)
  }
})

// verifica se o email é único no banco de dados
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

// verifica se o CPF é único no banco de dados
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

// verifica se o login é único no banco de dados
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

// inclui um usuário
router.post('/', auth.manager, async (req, res) => {
  try {
    const userRole = req.user.role
    const user = new User()

    user.username = req.body.username
    user.email = req.body.email
    user.name = req.body.name
    user.role = req.body.role
    user.cpf = req.body.cpf
    user.unitOfMeasurement = req.body.unitOfMeasurement
    user.buyerPosition = req.body.buyerPosition
    user.organization = req.body.organization
    user.comments = req.body.comments
    user.uf = req.body.uf
    user.city = req.body.city
    user.birthDate = req.body.birthDate
    user.gender = req.body.gender

    if (userRole === 'gestor') {
      user.role = 'mensageiro'
      user.organization = req.user.organization
    }

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

// altera um usuário
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }
    const userRole = req.user.role
    const userId = req.user.id

    if (userRole === 'mensageiro') {
      query._id = userId
    }

    const user = await User.findOne(query)

    if (user) {
      user.username = req.body.username
      user.email = req.body.email
      user.name = req.body.name
      user.role = req.body.role
      user.cpf = req.body.cpf
      user.unitOfMeasurement = req.body.unitOfMeasurement
      user.buyerPosition = req.body.buyerPosition
      user.currency = req.body.currency
      user.country = req.body.country
      user.nickname = req.body.nickname
      user.organization = req.body.organization
      user.comments = req.body.comments
      user.uf = req.body.uf
      user.city = req.body.city
      user.birthDate = req.body.birthDate
      user.gender = req.body.gender
      user.identity = req.body.identity

      if (userRole === 'gestor' || userRole === 'mensageiro') {
        user.role = 'mensageiro'
        user.organization = req.user.organization
      }

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

// altera os dados de perfil de um usuário
router.put('/:id/profile', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id }
    const userRole = req.user.role
    const userId = req.user.id

    if (userRole === 'mensageiro') {
      query._id = userId
    }

    const user = await User.findOne(query)

    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.username = req.body.username || user.username
      user.cpf = req.body.cpf || user.cpf
      user.unitOfMeasurement = req.body.unitOfMeasurement
      user.buyerPosition = req.body.buyerPosition
      user.currency = req.body.currency
      user.country = req.body.country
      user.nickname = req.body.nickname
      user.comments = req.body.comments
      user.uf = req.body.uf
      user.city = req.body.city
      user.birthDate = req.body.birthDate
      user.gender = req.body.gender
      user.identity = req.body.identity

      if (userRole === 'gestor' || userRole === 'mensageiro') {
        user.role = 'mensageiro'
        user.organization = req.user.organization
      }

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

// exclui um usuário
router.delete('/:id', auth.manager, (req, res) => {
  const query = { _id: req.params.id }
  const userRole = req.user.role

  if (userRole === 'gestor') {
    query.organization = req.user.organization
  }

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

// envia a mensagem de redefinição de senha ao usuário
router.post('/forgot-password', async (req, res) => {
  try {
    const query = { username: req.body.username }

    const user = await User.findOne(query)

    if (user) {
      // #region monta o link de redefinição da senha

      const tokenData = moment().format('YYYY-MM-DDTHH:mm') + '+' + user.id
      const token = Buffer.from(tokenData).toString('base64')
      const pathLink = path.posix.join(
        path.posix.sep,
        'usuarios',
        token,
        'trocar-senha'
      )
      const host =
        (req.headers.host.startsWith('local') ? 'http://' : '') +
        req.headers.host
      const link = new URL(pathLink, host).toString()

      // #endregion

      const text =
        '<p>Olá,</p>' +
        '<p>Conforme seu pedido, você está recebendo um link para redefinir a sua senha</p>' +
        `<p><a href="${link}">Clique aqui</a> para acessar esse link</p>`

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

// function que recupera informações de um token
const getTokenData = async function (token) {
  // decodifica o token
  const tokenData = Buffer.from(token, 'base64').toString('utf-8')
  const tokenArr = tokenData.split('+')

  // somente dois campos no token
  if (tokenArr.length === 2) {
    const tokenTime = moment(tokenArr[0], 'YYYY-MM-DDTHH:mm')

    // data+hora válida
    if (tokenTime.isValid()) {
      const now = moment()

      // 12 horas a mais de limite para o token
      if (now.isAfter(tokenTime) && now.diff(tokenTime, 'hours') < 12) {
        const userId = tokenArr[1]

        const query = { _id: userId }
        const userExists = await User.exists(query)

        return { valid: userExists, userId }
      }
    }
  }

  return { valid: false }
}

// valida o token de redefinição de senha
router.get('/password-reset/:token/valid', async (req, res) => {
  try {
    const isValid = (await getTokenData(req.params.token)).valid

    return res.send(isValid)
  } catch (err) {
    return res.send(false)
  }
})

// salva a nova senha ao usuário
router.post('/password-reset/:token', async (req, res) => {
  try {
    const token = req.params.token
    const tokenData = await getTokenData(token)

    if (!req.body.password) {
      return res.status(422).send('Preencha a senha')
    } else if (tokenData.valid) {
      const query = { _id: tokenData.userId }
      const user = await User.findOne(query)
      if (user) {
        user.setPassword(req.body.password)

        await user.save()

        return res.send(user)
      }
    } else {
      return res.status(422).send('Link expirado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao redefinir a senha do usuário: ' + err.message)
  }
})

module.exports = router
