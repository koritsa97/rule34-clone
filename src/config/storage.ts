import multer from 'multer';

import { UPLOADS_DIR } from '@/utils/constants';

export const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const upload = multer({
  storage,
});
