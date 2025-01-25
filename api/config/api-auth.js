// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization
    if (token === process.env.API_TOKEN) {
      next()
    } else {
      res.status(401).send('Acesso não autorizado')
    }
  }
  
  module.exports = authenticateToken
  