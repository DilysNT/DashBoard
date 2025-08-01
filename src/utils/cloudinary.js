// Cloudinary upload utility
const CLOUDINARY_CLOUD_NAME = 'dojbjbbjw';
const CLOUDINARY_API_KEY = '917871671915542';

export const uploadToCloudinary = async (file) => {
  try {
    console.log('🔄 Starting upload to Cloudinary...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudName: CLOUDINARY_CLOUD_NAME
    });

    // Kiểm tra file hợp lệ
    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }

    // Method 1: Try unsigned upload with common presets
    const presets = ['ml_default', 'default', 'unsigned_preset', 'tourism_preset'];
    
    for (const preset of presets) {
      try {
        console.log(`🔄 Trying upload with preset: ${preset}`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Cloudinary upload successful with preset:', preset, result);
          return result.secure_url; // Return only URL string
        } else {
          const errorText = await response.text();
          console.warn(`⚠️ Upload failed with preset ${preset}:`, errorText);
        }
      } catch (presetError) {
        console.warn(`⚠️ Error with preset ${preset}:`, presetError.message);
      }
    }

    // Method 2: Try signed upload with API key
    try {
      console.log('🔄 Trying signed upload with API key...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', CLOUDINARY_API_KEY);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Cloudinary upload successful with API key:', result);
        return result.secure_url; // Return only URL string
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Signed upload failed:', errorText);
      }
    } catch (signedError) {
      console.warn('⚠️ Signed upload error:', signedError.message);
    }

    // If all methods fail
    throw new Error('All upload methods failed. Please check Cloudinary configuration and ensure upload presets are properly configured.');

  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (files) => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

// Hàm để xóa ảnh từ Cloudinary (nếu cần)
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
      }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

// Utility functions for generating Cloudinary URLs
export const getCloudinaryUrl = (publicId, transformations = {}) => {
  if (!publicId) return null;
  
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    blur,
    radius,
  } = transformations;

  let transformString = `c_${crop},q_${quality},f_${format}`;
  
  if (width !== 'auto') transformString += `,w_${width}`;
  if (height !== 'auto') transformString += `,h_${height}`;
  if (blur) transformString += `,e_blur:${blur}`;
  if (radius) transformString += `,r_${radius}`;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
};

// Predefined image sizes for common use cases
export const getImageUrl = {
  // Thumbnail for cards, lists
  thumbnail: (publicId) => getCloudinaryUrl(publicId, { 
    width: 150, 
    height: 150, 
    crop: 'fill',
    quality: '80'
  }),
  
  // Small images for UI elements
  small: (publicId) => getCloudinaryUrl(publicId, { 
    width: 300, 
    height: 200, 
    crop: 'fill',
    quality: '80'
  }),
  
  // Medium images for modals, detail views
  medium: (publicId) => getCloudinaryUrl(publicId, { 
    width: 600, 
    height: 400, 
    crop: 'fill',
    quality: '85'
  }),
  
  // Large images for hero sections
  large: (publicId) => getCloudinaryUrl(publicId, { 
    width: 1200, 
    height: 600, 
    crop: 'fill',
    quality: '90'
  }),
  
  // Original size with optimization
  original: (publicId) => getCloudinaryUrl(publicId, { 
    quality: 'auto',
    format: 'auto'
  }),
  
  // Avatar/profile images
  avatar: (publicId) => getCloudinaryUrl(publicId, { 
    width: 80, 
    height: 80, 
    crop: 'fill',
    radius: 'max',
    quality: '80'
  }),
};

// Helper to extract public_id from Cloudinary URL
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  try {
    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' and any transformations
    let publicIdPart = urlParts.slice(uploadIndex + 1).join('/');
    
    // Remove transformation parameters (starts with first letter or number)
    const publicIdMatch = publicIdPart.match(/[a-zA-Z0-9].*/);
    if (publicIdMatch) {
      publicIdPart = publicIdMatch[0];
    }
    
    // Remove file extension
    return publicIdPart.replace(/\.[^/.]+$/, '');
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Validate if URL is from Cloudinary
export const isCloudinaryUrl = (url) => {
  return url && url.includes('res.cloudinary.com');
};