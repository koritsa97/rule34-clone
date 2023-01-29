import path from 'path';

export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const TagType = {
  CATEGORY: 'category',
  AUTHOR: 'author',
  FANDOM: 'fandom',
} as const;

export const ModelRef = {
  USER: 'user',
  POST: 'post',
  TAG: 'tag',
} as const;

export const PUBLIC_DIR = path.join(process.cwd(), 'public');
export const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

export const ImageWidth = {
  PREVIEW: 1000,
};
