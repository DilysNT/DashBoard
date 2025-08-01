// Test Cloudinary upload without preset
const CLOUDINARY_CLOUD_NAME = 'dojbjbbjw';

export const uploadToCloudinary = async (file) => {
  try {
    console.log('🔄 Testing upload without preset...', file.name);

    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Invalid file type');
    }

    // Test với auto preset (không cần config)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Built-in preset

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload OK:', result.secure_url);
      return {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      };
    }

    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
};
