import { Schema, model } from 'mongoose';

import { Theme, ModelRef } from '../utils/constants.js';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
    favoriteTags: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelRef.TAG,
      },
    ],
    favoritePosts: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelRef.POST,
      },
    ],
    theme: {
      type: String,
      required: true,
      default: Theme.LIGHT,
      enum: Object.values(Theme),
    },
  },
  {
    timestamps: true,
  }
);

export default model(ModelRef.USER, userSchema);
