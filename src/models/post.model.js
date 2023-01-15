import { Schema, model } from 'mongoose';

import { ModelRef } from '../utils/constants.js';

const postSchema = new Schema(
  {
    previewImageUrl: {
      type: String,
      required: true,
    },
    originalImageUrl: {
      type: String,
      required: true,
    },
    source: {
      type: String,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelRef.TAG,
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: ModelRef.USER,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

postSchema.virtual('tagsString').get(function () {
  return this.tags.map((tag) => tag.name).join(', ');
});

export const Post = model(ModelRef.POST, postSchema);
