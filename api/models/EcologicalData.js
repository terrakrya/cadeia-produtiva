const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const ObjectId = mongoose.Schema.Types.ObjectId

const secret = process.env.SECRET || 'cadeia-produtiva'

const EcologicalDataSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    regionId: {
      type: ObjectId,
      ref: 'Region',
      default: null,
    },
    peakBloomMonth: {
      type: Number,
      required: true,
    },
    rainySeasonStartMonth: {
      type: Number,
      required: true,
    },
    nextHarvestExpectation: {
      type: String,
      required: true,
    },
    harvestStartMonth: {
      type: Number,
      required: true,
    },
    harvestEndMonth: {
      type: Number,
      required: true,
    },
    harvestStartYear: {
      type: Number,
      required: true,
    },
    harvestEndYear: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
  { toJSON: { virtuals: true } }
)

EcologicalDataSchema.methods.data = function () {
  return {
    _id: this._id,
    id: this.id,
    userId: this.userId,
    region: this.region,
    regionId: this.regionId,
    peakBloomMonth: this.peakBloomMonth,
    rainySeasonStartMonth: this.rainySeasonStartMonth,
    nextHarvestExpectation: this.nextHarvestExpectation,
    harvestStartMonth: this.harvestStartMonth,
    harvestEndMonth: this.harvestEndMonth,
    harvestStartYear: this.harvestStartYear,
    harvestEndYear: this.harvestEndYear,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

EcologicalDataSchema.methods.generateJWT = function () {
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

EcologicalDataSchema.methods.toAuthJSON = function () {
  return {
    ...this.data(),
    token: this.generateJWT(),
  }
}

mongoose.model('EcologicalData', EcologicalDataSchema)
