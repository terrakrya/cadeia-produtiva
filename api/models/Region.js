const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const ObjectId = mongoose.Schema.Types.ObjectId

const secret = process.env.SECRET

const RegionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    specie: {
      type: ObjectId,
      ref: 'Specie',
      required: true,
      index: true,
    },
    municipalities: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        uf: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
          maxlength: 2,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

RegionSchema.index({ name: 1, specie: 1 }, { unique: true })
RegionSchema.index({ specie: 1})
RegionSchema.index({ 'municipalities.name': 1, 'municipalities.uf': 1 })

RegionSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    name: this.name,
    specie: this.specie,
    municipalities: this.municipalities,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

// Método para gerar JWT
RegionSchema.methods.generateJWT = function () {
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

// Método para dados com autenticação
RegionSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('Region', RegionSchema) 