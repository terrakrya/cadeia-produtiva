const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const secret = process.env.SECRET || 'cadeia-produtiva'

const TypeSchema = new mongoose.Schema(
  {
    type: String,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

TypeSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    code: this.code,
    description: this.description,
    type: this.type,
    name: this.name,
  }
}
TypeSchema.methods.generateJWT = function () {
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

TypeSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('Type', TypeSchema)
