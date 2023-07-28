const router = require('express').Router()
const passport = require('passport')
const mongoose = require('mongoose')
const auth = require('../config/auth')
const User = mongoose.model('User')
const ObjectId = mongoose.Types.ObjectId

router.use('/users', require('./users'))
router.use('/products', require('./products'))
router.use('/categories', require('./categories'))
router.use('/types', require('./types'))
router.use('/organizations', require('./organizations'))
router.use('/price-informations', require('./price-informations'))
router.use('/species', require('./species'))
router.use('/species-products', require('./species-products'))
router.use('/uploads', require('./uploads'))
router.use('/geographic-areas', require('./geographic-areas'))

router.post('/login', function (req, res, next) {
  if (!req.body.username) {
    return res.status(422).json('Preencha o login ou celular')
  }

  if (!req.body.password) {
    return res.status(422).json('Preencha sua senha')
  }

  passport.authenticate(
    'local',
    {
      session: true,
    },
    function (err, user, info) {
      if (err) {
        return next(err)
      }

      if (user) {
        user.token = user.generateJWT()
        return res.json(user.toAuthJSON())
      } else {
        return res.status(422).json('Usuário ou senha inválidos')
      }
    }
  )(req, res, next)
})

router.post('/auth', async function (req, res, next) {
  if (!req.body.token) {
    return res.status(422).json('Preencha o token')
  }

  if (req.body.token !== 'G9Zf61GBL2xtRsFTafGr') {
    return res.status(422).json('Token inválido')
  }

  // recupera o usuário de integração (que deve estar criado no BD)
  const user = await User.findOne({ _id: ObjectId('000000000000000000000000') })
  if (!user) {
    return res.status(422).json('Usuário de integração não criado')
  }

  user.token = user.generateUnlimitedJWT()

  return res.json(user.toUnlimitedAuthJSON())
})

router.get('/profile', auth.authenticated, function (req, res) {
  User.findById(req.user.id).exec(function (err, user) {
    if (!err && user) {
      res.send(user)
    } else {
      res.status(422).send('Usuário não encontrado')
    }
  })
})

router.post('/logout', function (req, res) {
  return res.json(true)
})

router.use(function (err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message

        return errors
      }, {}),
    })
  }

  return next(err)
})

module.exports = router
