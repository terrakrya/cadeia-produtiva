require('./models/User')
require('./config/passport')

const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI, {
    keepAlive: 1,
    connectTimeoutMS: 30000,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
} else {
  mongoose.connect('mongodb://localhost/cadeia-produtiva', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  mongoose.set('debug', true)
}
