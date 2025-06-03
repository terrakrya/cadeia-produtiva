const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

mongoose.model('Measurement', MeasurementSchema);
