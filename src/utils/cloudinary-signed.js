// Signed upload with ml_default preset
const CLOUDINARY_CLOUD_NAME = 'dojbjbbjw';
const CLOUDINARY_API_KEY = '917871671915542';
const CLOUDINARY_API_SECRET = '15gpUKeHDf1LZ3I0Jg5Sa4qIbPE';

// Simple signature generation for Cloudinary
function generateSignature(paramsToSign, secret) {
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&');
  
  // Basic hash for demo - in production use proper HMAC-SHA1
  const hash = btoa(sortedParams + secret).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
  return hash;
}

export const uploadToCloudinary = async (file) => {
  try {
    console.log('🔐 Signed upload with ml_default preset...', file.name);

    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Invalid file type');
    }

    const timestamp = Math.round(Date.now() / 1000);
    
    // Parameters to sign (bao gồm preset)
    const paramsToSign = {
      timestamp: timestamp,
      upload_preset: 'ml_default',
      folder: 'tour_images'
    };
    
    const signature = generateSignature(paramsToSign, CLOUDINARY_API_SECRET);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('upload_preset', 'ml_default');
    formData.append('folder', 'tour_images');
    formData.append('signature', signature);

    console.log('📤 Uploading with signed ml_default preset...');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('📨 Response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Signed upload successful:', result.secure_url);
      return {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };
    }

    const error = await response.text();
    console.error('❌ Signed upload failed:', error);
    throw new Error(`Signed upload failed: ${error}`);

  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (files) => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};
