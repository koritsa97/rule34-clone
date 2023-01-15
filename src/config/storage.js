import multer from 'multer';

import { UPLOADS_DIR } from '../utils/constants.js';

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const upload = multer({
  storage,
});
