import path from 'path';

export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const TagType = {
  CATEGORY: 'category',
  AUTHOR: 'author',
  FANDOM: 'fandom',
};

export const ModelRef = {
  USER: 'user',
  POST: 'post',
  TAG: 'tag',
};

export const PUBLIC_DIR = path.join(process.cwd(), 'public');
export const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
