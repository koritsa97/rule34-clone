import { Schema, model, Document, Types } from 'mongoose';

import { TagType, ModelRef } from '@/utils/constants';

export interface TagEntity extends Document {
  name: string;
  type: typeof TagType[keyof typeof TagType];
  owner: Types.ObjectId;
}

const tagSchema = new Schema<TagEntity>(
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
      default: TagType.CATEGORY,
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

export const Tag = model<TagEntity>(ModelRef.TAG, tagSchema);
