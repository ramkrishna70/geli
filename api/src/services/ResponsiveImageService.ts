import sharp = require('sharp');
import * as fs from 'fs';

import {BreakpointSize} from '../models/BreakpointSize';
import {IResponsiveImageData} from '../../../shared/models/IResponsiveImageData';

export default class ResponsiveImageService {
  /**
   * Takes an image and generates responsive images in the sizes we want to.
   *
   * The images will be saved in the same directory as the original file and we will
   * append the screen-size for which the responsive image is generated.
   *
   * The original file will be removed if we haven't specified an "original" breakpoint.
   *
   * @param originalFile
   * @param {IResponsiveImageData} responsiveImage
   * @returns {Promise<boolean>}
   */
  static async generateResponsiveImages(originalFile: any, responsiveImage: IResponsiveImageData) {
    if (!responsiveImage.breakpoints) {
      // Cannot generate any responsive images, because there are no breakpoints provided.
      return false;
    }

    const filename = originalFile.filename;
    const directory = originalFile.destination;
    const extension = filename.split('.').pop();
    const filenameWithoutExtension = filename.substring(0, filename.length - extension.length - 1);

    let keepOriginalFile = false;

    for (const breakpoint of responsiveImage.breakpoints) {
      if (breakpoint.screenSize === BreakpointSize.ORIGINAL) {
        keepOriginalFile = false;
        continue;
      }

      const fileNameToSave = filenameWithoutExtension + '_' + breakpoint.screenSize + '.' + extension;

      sharp.cache(false);

      await sharp(originalFile.path)
        .resize(breakpoint.imageSize.width)
        .withoutEnlargement(true)
        .max()
        .toFile(directory + '/' + fileNameToSave);

      // Retina

      const retinaWidth = breakpoint.imageSize.width * 2;
      const retinaFileNameToSave = filenameWithoutExtension + '_' + breakpoint.screenSize + '@2x.' + extension;

      await sharp(originalFile.path)
        .resize(retinaWidth)
        .withoutEnlargement(true)
        .max()
        .toFile(directory + '/' + retinaFileNameToSave);


      breakpoint.pathToImage = directory + '/' + fileNameToSave;
      breakpoint.pathToRetinaImage = directory + '/' + retinaFileNameToSave;
    }

    if (!keepOriginalFile) {
      fs.unlinkSync(originalFile.path);
      responsiveImage.pathToImage = '-';
    }
  }

}
