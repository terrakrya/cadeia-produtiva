const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const secret = process.env.SECRET || 'cadeia-produtiva'

const CategorySchema = new mongoose.Schema(
  {
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

CategorySchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    code: this.code,
    description: this.description,
  }
}
CategorySchema.methods.generateJWT = function () {
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

CategorySchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('Category', CategorySchema)
