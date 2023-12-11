const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Decimal = require('decimal.js')
const ObjectId = mongoose.Schema.Types.ObjectId

const secret = process.env.SECRET || 'cadeia-produtiva'

const PriceSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      required: true,
    },
    buyerPosition: {
      type: String,
    },
    buyerPositionSeller: {
      type: String,
      required: true,
    },
    buyerPositionBuyer: {
      type: String,
      required: true,
    },
    transaction: {
      type: String,
      required: true,
    },
    transactedQuantity: {
      type: Number,
      required: true,
    },
    originalMinimumPrice: {
      type: Number,
      required: true,
    },
    originalMaximumPrice: {
      type: Number,
      required: true,
    },
    minimumPrice: {
      type: Number,
    },
    originalPrice: {
      type: Number,
    },
    maximumPrice: {
      type: Number,
    },
    averagePrice: {
      type: Number,
    },
    country: String,
    currency: String,
    square: String,
    squareid: String,
    measure: {
      type: String,
      required: true,
    },
    measurePrice: {
      type: String,
      required: true,
    },
    product: {
      type: ObjectId,
      ref: 'Product',
      required: true,
    },
    messenger: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    uf: String,
    city: String,
    organization: {
      type: ObjectId,
      ref: 'Organization',
    },
    region: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

const getConversion = (measure) => {
  if (measure === 'Kg') {
    return 1
  } else if (measure === 'Tonelada') {
    return 1000
  } else if (measure === 'Lata') {
    return 12
  } else if (measure === 'Caixa') {
    return 24
  } else if (measure === 'Hectolitro') {
    return 60
  } else if (measure === 'Saca') {
    return 48
  } else if (measure === 'Barrica') {
    return 72
  }
}

// pre save middleware
PriceSchema.pre('save', function (next) {
  const conversion = getConversion(this.measure)
  const min = this.originalMinimumPrice
  const max = this.originalMaximumPrice

  let quant = 1
  if (!this.transaction) {
    quant = this.transactedQuantity
  }

  this.minimumPrice = new Decimal(min).div(conversion).div(quant).toFixed(2)
  this.maximumPrice = new Decimal(max).div(conversion).div(quant).toFixed(2)
  this.averagePrice = (this.minimumPrice + this.maximumPrice) / 2

  next()
})

PriceSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    createdAt: this.createdAt,
    buyerPosition: this.buyerPosition,
    minimumPrice: this.minimumPrice,
    maximumPrice: this.maximumPrice,
    currency: this.currency,
    country: this.country,
    measure: this.measure,
    measurePrice: this.measurePrice,
    product: this.product,
    messenger: this.messenger,
    uf: this.uf,
    city: this.city,
    organization: this.organization,
    transaction: this.transaction,
    transactedQuantity: this.transactedQuantity,
    originalPrice: this.originalPrice,
    region: this.region,
  }
}
PriceSchema.methods.generateJWT = function () {
  const today = new Date()
  const exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return jwt.sign(
    {
      ...this.data(),
      exp: parseInt(exp.getTime() / 1000),
    },
    secret
  )
}

PriceSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('PriceInformation', PriceSchema)
