import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from 'path';

export const fileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
    return callback(
      new HttpException(
        'Only pdf and image files are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExt = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExt}`);
};
