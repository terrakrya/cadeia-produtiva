const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const ObjectId = mongoose.Schema.Types.ObjectId

const secret = process.env.SECRET || 'cadeia-produtiva'

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    description: String,

    specieProduct: {
      type: ObjectId,
      ref: 'SpeciesProduct',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

ProductSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    code: this.code,
    description: this.description,
    specieProduct: this.specieProduct,
    name: this.name,
  }
}
ProductSchema.methods.generateJWT = function () {
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

ProductSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('Product', ProductSchema)
