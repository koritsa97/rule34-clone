import { Schema, model, Document, Types } from 'mongoose';

import { ModelRef } from '@/utils/constants';

export interface PostEntity extends Document {
  previewImageUrl: string;
  originalImageUrl: string;
  source?: string;
  tags: Types.ObjectId[];
  tagsString?: String;
  owner: Types.ObjectId;
}

const postSchema = new Schema<PostEntity>(
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
    tagsString: String,
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
    toObject: {
      virtuals: true,
    },
  }
);

export const Post = model<PostEntity>(ModelRef.POST, postSchema);
