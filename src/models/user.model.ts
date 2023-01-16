import { Schema, model, Document, Types } from 'mongoose';

import { Theme, ModelRef } from '@/utils/constants';

export interface UserEntity extends Document {
  username: string;
  password: string;
  avatarUrl: string;
  favoriteTags: Types.ObjectId[];
  favoritePosts: Types.ObjectId[];
  theme: typeof Theme[keyof typeof Theme];
}

const userSchema = new Schema<UserEntity>(
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

export const User = model<UserEntity>(ModelRef.USER, userSchema);
