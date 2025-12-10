import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process and compress image
 * @param {string} inputPath - Path to original image
 * @param {object} options - Processing options
 * @returns {Promise<object>} - Paths to processed images
 */
export const processImage = async (inputPath, options = {}) => {
  try {
    const {
      width = 1920,
      height = null,
      quality = 80,
      createThumbnail = true,
      thumbnailWidth = 300,
      thumbnailHeight = 300
    } = options;

    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const dirname = path.dirname(inputPath);

    // Process main image
    const processedPath = path.join(dirname, `${basename}-processed${ext}`);
    
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality, progressive: true })
      .toFile(processedPath);

    const result = {
      original: inputPath,
      processed: processedPath,
      thumbnail: null
    };

    // Create thumbnail if requested
    if (createThumbnail) {
      const thumbnailPath = path.join(dirname, `${basename}-thumb${ext}`);
      
      await sharp(inputPath)
        .resize(thumbnailWidth, thumbnailHeight, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);

      result.thumbnail = thumbnailPath;
    }

    // Delete original if processing was successful
    if (fs.existsSync(inputPath) && processedPath !== inputPath) {
      fs.unlinkSync(inputPath);
    }

    return result;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Process multiple images
 * @param {Array} files - Array of file objects from multer
 * @param {object} options - Processing options
 * @returns {Promise<Array>} - Array of processed image paths
 */
export const processMultipleImages = async (files, options = {}) => {
  try {
    const processedImages = [];

    for (const file of files) {
      const result = await processImage(file.path, options);
      processedImages.push({
        original: file.originalname,
        url: result.processed.replace(/\\/g, '/').split('uploads/')[1],
        thumbnail: result.thumbnail ? result.thumbnail.replace(/\\/g, '/').split('uploads/')[1] : null,
        size: file.size,
        mimetype: file.mimetype
      });
    }

    return processedImages;
  } catch (error) {
    console.error('Error processing multiple images:', error);
    throw new Error('Failed to process images');
  }
};

/**
 * Delete image file
 * @param {string} imagePath - Relative path to image
 */
export const deleteImage = async (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '../../uploads', imagePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Also delete thumbnail if exists
    const ext = path.extname(fullPath);
    const basename = path.basename(fullPath, ext);
    const dirname = path.dirname(fullPath);
    const thumbnailPath = path.join(dirname, `${basename}-thumb${ext}`);
    
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Delete multiple images
 * @param {Array} imagePaths - Array of relative paths to images
 */
export const deleteMultipleImages = async (imagePaths) => {
  try {
    const results = [];
    
    for (const imagePath of imagePaths) {
      const result = await deleteImage(imagePath);
      results.push({ path: imagePath, deleted: result });
    }

    return results;
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw new Error('Failed to delete images');
  }
};

/**
 * Get image metadata
 * @param {string} imagePath - Path to image
 * @returns {Promise<object>} - Image metadata
 */
export const getImageMetadata = async (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '../../uploads', imagePath);
    const metadata = await sharp(fullPath).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw new Error('Failed to get image metadata');
  }
};

/**
 * Optimize existing image
 * @param {string} imagePath - Relative path to image
 * @param {object} options - Optimization options
 */
export const optimizeImage = async (imagePath, options = {}) => {
  try {
    const fullPath = path.join(__dirname, '../../uploads', imagePath);
    const { quality = 80 } = options;

    const tempPath = fullPath + '.tmp';
    
    await sharp(fullPath)
      .jpeg({ quality, progressive: true })
      .toFile(tempPath);

    // Replace original with optimized
    fs.unlinkSync(fullPath);
    fs.renameSync(tempPath, fullPath);

    return true;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error('Failed to optimize image');
  }
};

export default {
  processImage,
  processMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getImageMetadata,
  optimizeImage
};

