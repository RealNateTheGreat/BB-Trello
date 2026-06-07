import React, { useRef, useState } from 'react';
import { Upload, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  className = 'w-24 h-24'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage.from('avatars').upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image');
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onImageChange(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <div
          className={`${className} flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 transition-colors hover:border-red-400`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.24)',
            borderColor: 'rgba(239, 68, 68, 0.45)'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-red-200">
              <User className="mb-1 h-8 w-8" />
              <span className="text-xs">No Image</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-red-400" />
            </div>
          )}
        </div>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 transition-colors hover:bg-red-600"
            aria-label="Remove image"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm text-red-100 transition-colors hover:bg-red-950/30 disabled:opacity-50"
          style={{ borderColor: 'rgba(239, 68, 68, 0.45)' }}
        >
          <Upload className="h-4 w-4" />
          <span>{previewUrl ? 'Change Image' : 'Upload Image'}</span>
        </button>

        <p className="text-center text-xs text-red-100/70">Max 5MB, JPG, PNG, GIF</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
