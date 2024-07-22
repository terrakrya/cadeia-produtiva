import { Schema, model } from 'mongoose'
const ObjectId = Schema.Types.ObjectId

const LayerSchema = new Schema(
  {
    map: {
      type: ObjectId,
      ref: 'Map',
    },
    name: {
      type: String,
      required: true,
    },
    user: {
      type: ObjectId,
      ref: 'User',
    },
    create_user_rule: {
      type: String,
      required: true,
    },
    time_get_from_api: {
      type: Date,
    },
    seq_get_from_api: {
      type: Number,
      default: 0,
    },
    icon: String,
    iconColor: String,
    show: {
      type: Boolean,
      default: false,
    },
    cronUrl: String,
    cronToken: String,
    do_request: {
      type: Boolean,
      default: true,
    },
    cron: String,
    integrationMethod: String,
    dataStore: String,
    layerName: String,
    polygon: {
      type: [[Number]],
    },
    color: {
      label: String,
      value: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

LayerSchema.virtual('shapes', {
  ref: 'Shape',
  localField: '_id',
  foreignField: 'layer',
})

model('Layer', LayerSchema)
