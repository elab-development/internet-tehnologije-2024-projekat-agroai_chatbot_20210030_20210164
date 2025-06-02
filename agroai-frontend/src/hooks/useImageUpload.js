import { useState } from 'react';
import axios from 'axios';

export default function useImageUpload() {
  const [imageUrl, setImageUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const onFileSelect = (file) => {
    if (!file) return;

    setUploadError('');
    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const fullDataUrl = reader.result; 
        const base64only = fullDataUrl.split(',')[1];

        const formData = new FormData();
        formData.append('image', base64only);
        formData.append('expiration', '600'); 

        const imgbbKey = process.env.REACT_APP_IMGBB_API_KEY;
        if (!imgbbKey) {
          setUploadError('Missing ImgBB API key.');
          setUploading(false);
          return;
        }

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        const data = response.data?.data;
        if (data?.display_url) {
          setImageUrl(data.display_url);
        } else {
          setUploadError('Upload succeeded but no URL was returned.');
        }
      } catch (err) {
        console.error('ImgBB upload failed:', err);
        setUploadError('Image upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read file.');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageUrl('');
    setUploadError('');
    setUploading(false);
  };

  return {
    imageUrl,
    uploading,
    uploadError,
    onFileSelect,
    removeImage,
  };
}
