import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import 'dotenv/config';

const storage = new GridFsStorage({
  url: process.env.URL_MONGODB || '',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ['image/png', 'image/jpeg'];
    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-datn-ltmt6-${file.originalname}`;
      return filename;
    }
    return {
      bucketName: 'photos',
      filename: `${Date.now()}-datn-ltmt6-${file.originalname}`,
    };
  },
});

export const upload = multer({ storage });
