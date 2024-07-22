const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const secret = process.env.SECRET || 'cadeia-produtiva'

const SpecieSchema = new mongoose.Schema(
  {
    scientificName: {
      type: String,
      unique: true,
      required: true,
    },
    popularName: {
      type: String,
      required: true,
    },

    description: String,
    images: [Object],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

SpecieSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    scientificName: this.scientificName,
    popularName: this.popularName,
    description: this.description,
    images: this.images,
  }
}
SpecieSchema.methods.generateJWT = function () {
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

SpecieSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('Specie', SpecieSchema)
