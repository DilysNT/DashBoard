// Production-safe Cloudinary config
// API Secret should NEVER be exposed in frontend code
// This is for development/testing only

const CLOUDINARY_CLOUD_NAME = 'dojbjbbjw';
const CLOUDINARY_API_KEY = '917871671915542';

// For production, use only unsigned upload presets
const PRODUCTION_PRESETS = [
  'ml_default',    // Default preset
  'tourism_preset' // Custom preset (needs to be created)
];

export const uploadToCloudinary = async (file) => {
  try {
    console.log('🔄 Starting upload to Cloudinary...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudName: CLOUDINARY_CLOUD_NAME
    });

    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }

    // Use unsigned upload with presets (production-safe)
    for (const preset of PRODUCTION_PRESETS) {
      try {
        console.log(`🔄 Trying upload preset: ${preset}`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);
        formData.append('folder', 'tour_images');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Upload successful with preset:', preset, result);
          return {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          };
        } else {
          const errorText = await response.text();
          console.warn(`⚠️  Upload failed with preset ${preset}:`, errorText);
        }
      } catch (presetError) {
        console.warn(`⚠️  Error with preset ${preset}:`, presetError.message);
      }
    }

    throw new Error('All upload presets failed. Please check Cloudinary preset configuration.');

  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (files) => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};
