// Cloudinary client-side upload utility
// This implementation uses direct uploads to Cloudinary without requiring the Node.js library

interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Upload a file to Cloudinary using direct upload with API key
 * @param file The file to upload
 * @param options Upload options
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  if (!apiKey) {
    throw new Error("Cloudinary API key is not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("cloud_name", cloudName);
  formData.append("timestamp", Math.round(Date.now() / 1000).toString());

  // Add optional parameters
  if (options.folder) {
    formData.append("folder", options.folder);
  }
  if (options.public_id) {
    formData.append("public_id", options.public_id);
  }
  if (options.overwrite !== undefined) {
    formData.append("overwrite", options.overwrite.toString());
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Cloudinary upload failed: ${response.statusText} - ${errorData.error?.message || ""}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Configure Cloudinary (for compatibility with existing code)
 */
export const cloudinary = {
  uploader: {
    upload: uploadToCloudinary,
  },
  config: () => ({
    cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
    api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  }),
};

export default cloudinary;