import './database'

import path from 'path'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import routes from './routes'
import swagger from './swagger'

const app = express()
const router = express.Router()
const secret = process.env.SECRET || process.env.npm_package_name

app.use(cors())

app.use(
  session({
    secret,
    cookie: { maxAge: null },
    resave: false,
    saveUninitialized: false,
  })
)

app.use(express.urlencoded({ extended: false, limit: '100mb' }))
app.use(express.json({ limit: '100mb' }))
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
app.set('etag', false) // turn off

// Add Swagger documentation route
app.use('/docs', swagger.serve, swagger.setup)

router.use(routes)

app.use(router)

module.exports = {
  path: '/api',
  handler: app,
}
