const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const ObjectId = mongoose.Schema.Types.ObjectId

const secret = process.env.SECRET || 'cadeia-produtiva'

const SpeciesProductSchema = new mongoose.Schema(
  {
    type: String,
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: String,
    subgroup: String,
    class: String,
    group: String,
    specie: [
      {
        type: ObjectId,
        ref: 'scientificName',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

SpeciesProductSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    name: this.name,
    description: this.description,
    type: this.type,
    specie: this.specie,
    subgroup: this.subgroup,
    class: this.class,
    group: this.group,
  }
}
SpeciesProductSchema.methods.generateJWT = function () {
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

SpeciesProductSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('SpeciesProduct', SpeciesProductSchema)
