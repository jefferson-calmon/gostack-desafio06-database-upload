import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

export default {
  directory: path.resolve(__dirname, '..', '..', 'tmp'),

  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'tmp'),
    filename: (request, file, callback) => {
      const hash = crypto.randomBytes(10).toString('hex');

      const fileName = `${hash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
