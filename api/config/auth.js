const jwt = require('express-jwt')
const secret = process.env.SECRET

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1]
  }

  return null
}

function isAdmin(req) {
  return hasRole(req, 'admin')
}

function isGlobalManager(req) {
  return hasRole(req, 'gestor-global')
}

function isManager(req) {
  return hasRole(req, 'gestor')
}

function hasRole(req, role) {
  return req.user && req.user.role === role
}

function authenticatedAdmin(req, res, next) {
  if (isAdmin(req)) {
    next()
  } else {
    return res.status(403).json({
      status: 403,
      message:
        'A permissão de administrador é necessária para acessar este recurso.',
    })
  }
}

function authenticatedGlobalManager(req, res, next) {
  if (isGlobalManager(req) || isAdmin(req)) {
    next()
  } else {
    return res.status(403).json({
      status: 403,
      message:
        'A permissão de Gestor Global é necessária para acessar este recurso.',
    })
  }
}

function authenticatedManager(req, res, next) {
  if (isManager(req) || isGlobalManager(req) || isAdmin(req)) {
    next()
  } else {
    return res.status(403).json({
      status: 403,
      message: 'A permissão de Gestor é necessária para acessar este recurso.',
    })
  }
}

const jwtOptions = jwt({
  secret,
  algorithms: ['HS256'],
  userProperty: 'user',
  getToken: getTokenFromHeader,
})

const auth = {
  admin: [jwtOptions, authenticatedAdmin],
  globalManager: [jwtOptions, authenticatedGlobalManager],
  manager: [jwtOptions, authenticatedManager],
  authenticated: jwtOptions,
  optional: jwt({
    secret,
    userProperty: 'user',
    algorithms: ['HS256'],
    credentialsRequired: false,
    getToken: getTokenFromHeader,
  }),
  isAdmin,
  isGlobalManager,
  isManager,
  hasRole,
}

module.exports = auth
