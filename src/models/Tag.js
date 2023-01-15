import { Schema, model } from 'mongoose';

import { TagType, ModelRef } from '../utils/constants.js';

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(TagType),
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: ModelRef.USER,
    },
  },
  {
    timestamps: true,
  }
);

export default model(ModelRef.TAG, tagSchema);
