import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dnskl0pk3',
      api_key: '795786264514789',
      api_secret: 'EdTtoK2zXMJ62f0vwjT6QDSNN7w',
    });
  },
};