import { Injectable } from '@nestjs/common';

const ImageKit = require('imagekit');
@Injectable()
export class ImageKitService {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  async uploadImage(file: Express.Multer.File) {
    const uploadResponse = await this.imagekit.upload({
      file: file.buffer.toString('base64'), // required
      fileName: file.originalname, // required
      folder: '/questions', // optional
    });

    return uploadResponse.url;
  }
}
