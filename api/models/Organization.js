const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const secret = process.env.SECRET || 'cadeia-produtiva'

const OrganizationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    cnpj: String,
    address: String,
    OccupationArea: String,
    contact: String,
    EloProdutiva: String,
    region: String,
    ProtectedArea: String,
    territory: String,
    members: String,
    product: String,
    BoaPratica: String,
    certification: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

OrganizationSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    name: this.name,
    cnpj: this.cnpj,
    type: this.type,
    address: this.address,
    OccupationArea: this.OccupationArea,
    contact: this.contact,
    EloProdutiva: this.EloProdutiva,
    region: this.region,
    ProtectedArea: this.ProtectedArea,
    territory: this.territory,
    members: this.members,
    product: this.product,
    BoaPratica: this.BoaPratica,
    certification: this.certification,
  }
}
OrganizationSchema.methods.generateJWT = function () {
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

OrganizationSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('Organization', OrganizationSchema)
