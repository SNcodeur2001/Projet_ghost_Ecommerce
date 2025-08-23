import { cloudinary } from './cloudinary';

// Test Cloudinary configuration
export const testCloudinaryConfig = () => {
  try {
    const config = cloudinary.config();
    console.log('Cloudinary configured with cloud name:', config.cloud_name);
    return true;
  } catch (error) {
    console.error('Cloudinary configuration error:', error);
    return false;
  }
};