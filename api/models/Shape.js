import { Schema, model } from 'mongoose'
import GeoJSON from './GeoJSON'
const ObjectId = Schema.Types.ObjectId

const ShapeSchema = new Schema(
  {
    title: String,
    subtitle: String,
    body: String,
    url: String,
    geo_json: {
      type: GeoJSON,
    },
    layer: {
      type: ObjectId,
      ref: 'Layer',
    },
    time_get_from_api: {
      type: Date,
    },
    seq_get_from_api: {
      type: Number,
      default: 0,
    },
    properties: {
      type: Object,
      default: () => null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

model('Shape', ShapeSchema)
