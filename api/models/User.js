const crypto = require('crypto')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const ObjectId = mongoose.Schema.Types.ObjectId

const secret = process.env.SECRET || 'cadeia-produtiva'

const UserSchema = new mongoose.Schema(
  {
    role: String,
    unitOfMeasurement: String,
    buyerPosition: String,
    currency: String,
    country: String,
    nickname: String,
    comments: String,
    uf: String,
    city: String,
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      index: true,
    },
    name: String,
    cpf: {
      type: String,
      required: true,
      uniqui: true,
    },
    email: {
      type: String,
      lowercase: true,
      index: {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
      },
      default: null,
    },
    hash: String,
    salt: String,
    organization: {
      type: ObjectId,
      ref: 'Organization',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

UserSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex')
  return this.hash === hash
}

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex')
}

UserSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    role: this.role,
    username: this.username,
    email: this.email,
    name: this.name,
    nickname: this.nickname,
    unitOfMeasurement: this.unitOfMeasurement,
    buyerPosition: this.buyerPosition,
    currency: this.currency,
    country: this.country,
    organization: this.organization,
    uf: this.uf,
    city: this.city,
  }
}
UserSchema.methods.generateJWT = function () {
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

UserSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('User', UserSchema)
