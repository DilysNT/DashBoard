// Simple Cloudinary upload - sử dụng preset có sẵn
const CLOUDINARY_CLOUD_NAME = 'dojbjbbjw';

export const uploadToCloudinary = async (file) => {
  try {
    console.log('🔄 Simple upload test to Cloudinary...', file.name);

    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }

    // Thử nhiều preset names khác nhau
    const presets = [
      '', // No preset - sometimes works
      'ml_default',
      'default', 
      'unsigned_preset',
      'tourism_preset'
    ];

    for (const preset of presets) {
      try {
        console.log(`🔄 Trying ${preset || 'no preset'}...`);
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Chỉ thêm preset nếu có
        if (preset) {
          formData.append('upload_preset', preset);
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        console.log(`📨 Response for ${preset || 'no preset'}:`, response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Upload successful with:', preset || 'no preset', result);
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
          console.warn(`⚠️  Failed with ${preset || 'no preset'}:`, errorText);
        }
      } catch (presetError) {
        console.warn(`⚠️  Error with ${preset || 'no preset'}:`, presetError.message);
      }
    }

    throw new Error('All upload methods failed. Please check Cloudinary settings.');

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (files) => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};
