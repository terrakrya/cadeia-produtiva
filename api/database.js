import './models/User'
import './models/Category'
import './models/Type'
import './models/Organization'
import './models/PriceInformation'
import './models/SpeciesProduct'
import './models/Specie'
import './models/Product'
import './models/GeographicArea'
import './config/passport'
import './models/Map'
import './models/Layer'
import './models/Shape'

import { writeFileSync } from 'fs'

import { set, connect } from 'mongoose'
set('useCreateIndex', true)

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  // Create certificate file from env var (because mongoose doesnt accept cert data directly)
  writeFileSync('./api/config/mongodb.ca.crt', process.env.MONGO_CA_CERT)

  connect(process.env.MONGODB_URI, {
    keepAlive: 1,
    connectTimeoutMS: 30000,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
} else {
  mongoose.connect('mongodb://127.0.0.1/' + process.env.npm_package_name, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  set('debug', true)
}
