require('./models/User')
require('./models/Category')
require('./models/Type')
require('./models/Organization')
require('./models/PriceInformation')
require('./models/SpeciesProduct')
require('./models/Specie')
require('./models/Product')
require('./config/passport')

const fs = require('fs')

const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  // Create certificate file from env var (because mongoose doesnt accept cert data directly)
  fs.writeFileSync('./api/config/mongodb.ca.crt', process.env.MONGO_CA_CERT)

  mongoose.connect(process.env.MONGODB_URI, {
    keepAlive: 1,
    connectTimeoutMS: 30000,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
} else {
  mongoose.connect('mongodb://localhost/' + process.env.npm_package_name, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  mongoose.set('debug', true)
}
