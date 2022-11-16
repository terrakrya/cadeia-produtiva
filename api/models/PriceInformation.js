const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const ObjectId = mongoose.Schema.Types.ObjectId

const secret = process.env.SECRET || 'cadeia-produtiva'

const PriceSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      required: true,
    },
    buyerPosition: String,
    price: {
      type: Number,
      required: true,
    },
    coin: String,
    country: String,
    measure: {
      type: String,
      required: true,
    },
    product: [
      {
        type: ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
    messenger: [
      {
        type: ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

PriceSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    createdAt: this.createdAt,
    buyerPosition: this.buyerPosition,
    price: this.price,
    coin: this.coin,
    country: this.country,
    measure: this.measure,
    product: this.product,
    messenger: this.messenger,
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
