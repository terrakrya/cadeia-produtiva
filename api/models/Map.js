import { Schema, model } from 'mongoose'

const MapSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    zoom: {
      type: Number,
      required: true,
    },
    center: {
      type: [Number],
      required: true,
    },
    scrollWheelZoom: {
      type: Boolean,
      default: false,
    },
    public: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

MapSchema.virtual('layers', {
  ref: 'Layer',
  localField: '_id',
  foreignField: 'map',
})

model('Map', MapSchema)
