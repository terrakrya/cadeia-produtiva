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
    totalTransactionValue: {
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
  switch (measure) {
    case 'Kg':
      return 1
    case 'Tonelada':
      return 1000
    case 'Lata':
      return 12
    case 'Caixa':
      return 24
    case 'Hectolitro':
      return 60
    case 'Saca':
      return 48
    case 'Barrica':
      return 72
    default:
      return 1
  }
}

// pre save middleware
PriceSchema.pre('save', function (next) {
  const conversion = getConversion(this.measure)

  if (this.transaction === 'oferta de preços') {
    // Para ofertas de preços (preços de mercado)
    const min = new Decimal(this.originalMinimumPrice)
    const max = new Decimal(this.originalMaximumPrice)

    this.minimumPrice = min.div(conversion)
    this.maximumPrice = max.div(conversion)
    this.totalTransactionValue = null
  } else if (this.transaction === 'preço da venda') {
    // Para transações realizadas
    const pricePerUnit = new Decimal(this.originalPrice)
    const quantity = new Decimal(this.transactedQuantity)

    // Calcula o valor total da transação
    this.totalTransactionValue = pricePerUnit.times(quantity)

    // Define os preços mínimo e máximo originais
    this.originalMinimumPrice = this.originalPrice
    this.originalMaximumPrice = this.originalPrice

    // Converte o preço por unidade para preço por kg
    this.minimumPrice = pricePerUnit.div(conversion)
    this.maximumPrice = this.minimumPrice
  }

  // Calcula o preço médio com a precisão completa
  this.averagePrice = new Decimal(this.minimumPrice)
    .plus(new Decimal(this.maximumPrice))
    .div(2)

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
    product: this.product,
    messenger: this.messenger,
    uf: this.uf,
    city: this.city,
    organization: this.organization,
    transaction: this.transaction,
    transactedQuantity: this.transactedQuantity,
    originalPrice: this.originalPrice,
    totalTransactionValue: this.totalTransactionValue,
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
