// Simple unsigned upload cho ml_default preset
const CLOUDINARY_CLOUD_NAME = 'dojbjbbjw';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Preset đã chuyển thành unsigned

export const uploadToCloudinary = async (file) => {
  try {
    console.log('📤 Starting unsigned upload to Cloudinary...', {
      fileName: file.name,
      fileSize: file.size,
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET
    });

    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    console.log('🚀 Uploading to:', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('📨 Response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful:', {
        url: result.secure_url,
        public_id: result.public_id,
        size: result.bytes
      });
      
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
      console.error('❌ Upload failed:', errorText);
      throw new Error(`Upload failed: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (files) => {
  try {
    console.log('📤 Starting multiple uploads...', files.length, 'files');
    
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    
    console.log('✅ Multiple uploads successful:', results.length, 'files uploaded');
    return results;
    
  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    throw error;
  }
};
