const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const ObjectId = mongoose.Schema.Types.ObjectId

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
    acting: String,
    cnpj: String,
    address: String,
    territory: String,
    contact: String,
    chainLink: String,
    square: String,
    squareid: String,
    uf: String,
    county: String,
    email: {
      type: String,
      required: true,
    },
    members: Number,
    comments: String,
    sigla: String,
    otherContacts: String,
    products: [
      {
        type: ObjectId,
        ref: 'Product',
      },
    ],
    bestPractices: [
      {
        type: ObjectId,
        ref: 'Type',
      },
    ],
    certifications: [
      {
        type: ObjectId,
        ref: 'Type',
      },
    ],
    socialNetwork: String,
    site: String,
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
    territory: this.territory,
    contact: this.contact,
    chainLink: this.chainLink,
    square: this.square,
    squareid: this.squareid,
    uf: this.uf,
    county: this.county,
    members: this.members,
    products: this.products,
    bestPractices: this.bestPractices,
    certifications: this.certifications,
    comments: this.comments,
    email: this.email,
    otherContacts: this.otherContacts,
    sigla: this.sigla,
    acting: this.acting,
    socialNetwork: this.socialNetwork,
    site: this.site,
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
