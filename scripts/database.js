// Apenas modelos essenciais para migração de measurements
require('../api/models/User')
require('../api/models/Organization')
require('../api/models/PriceInformation')
require('../api/models/SpeciesProduct')
require('../api/models/Specie')
require('../api/models/Product')
require('../api/models/Measurement')

const mongoose = require('mongoose')

mongoose.set('useCreateIndex', true)

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI, {
    keepAlive: 1,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
} else {
  mongoose.connect('mongodb://127.0.0.1/' + process.env.npm_package_name, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  mongoose.set('debug', true)
} 