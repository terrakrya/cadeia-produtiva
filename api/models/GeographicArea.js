const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const secret = process.env.SECRET

const GeographicAreaSchema = new mongoose.Schema(
  {
    uf: String,
    county: String,
    square: String,
    squareid: String,
    name: String,
    comments: String,
    teste: Object,
    file: [Object],
    polygon: {
      type: [Array],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

GeographicAreaSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    uf: this.uf,
    county: this.county,
    square: this.square,
    name: this.name,
    comments: this.comments,
    file: this.file,
    teste: this.teste,
  }
}
GeographicAreaSchema.methods.generateJWT = function () {
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

GeographicAreaSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('GeographicArea', GeographicAreaSchema)
