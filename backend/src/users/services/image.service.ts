import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageService {
  async saveImageLocally(imageUrl: string, saveFolderPath: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, { responseType: 'stream' });

      const randomFileName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

      const fileExtension = path.extname(imageUrl);
      const localFilePath = path.join(saveFolderPath, randomFileName + fileExtension);
      const writer = fs.createWriteStream(localFilePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(path.basename(localFilePath)));
        writer.on('error', (error) => reject(error));
      });
    } catch (error) {
      throw new Error('Error while saving the image: ' + error.message);
    }
  }
}