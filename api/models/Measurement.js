const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const MeasurementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    referenceInKg: {
      type: Number,
      required: true,
    },
    specie: {
      type: ObjectId,
      ref: 'Specie',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

MeasurementSchema.query.notDeleted = function () {
  return this.where({ deletedAt: null })
}

MeasurementSchema.methods.softDelete = function () {
  this.deletedAt = new Date()
  return this.save()
}

MeasurementSchema.methods.isDeleted = function () {
  return this.deletedAt != null
}

mongoose.model('Measurement', MeasurementSchema)
