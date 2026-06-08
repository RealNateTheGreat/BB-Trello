import React, { useRef, useState } from 'react';
import { FileVideo, Image as ImageIcon, Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isVideoUrl } from '../lib/media';

interface MediaUploadProps {
  currentMedia?: string[];
  onMediaChange: (mediaUrls: string[]) => void;
  className?: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const MediaUpload: React.FC<MediaUploadProps> = ({ currentMedia = [], onMediaChange, className = 'h-28 w-28' }) => {
  const [mediaUrls, setMediaUrls] = useState<string[]>(currentMedia.filter(Boolean));
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMedia = (nextMedia: string[]) => {
    setMediaUrls(nextMedia);
    onMediaChange(nextMedia);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const invalidFile = files.find((file) => !file.type.startsWith('image/') && !file.type.startsWith('video/'));
    if (invalidFile) {
      alert('Media uploads support images and videos.');
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) {
      alert('Each media file must be less than 25MB.');
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error } = await supabase.storage.from('avatars').upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          alert('Failed to upload media.');
          continue;
        }

        const {
          data: { publicUrl }
        } = supabase.storage.from('avatars').getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        updateMedia([...mediaUrls, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload media.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeMedia = (url: string) => {
    updateMedia(mediaUrls.filter((mediaUrl) => mediaUrl !== url));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {mediaUrls.map((url) => (
          <div key={url} className={`relative overflow-hidden rounded-lg border-2 ${className}`} style={{ borderColor: 'rgba(239, 68, 68, 0.45)' }}>
            {isVideoUrl(url) ? (
              <video src={url} className="h-full w-full object-cover" muted />
            ) : (
              <img src={url} alt="Uploaded media" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeMedia(url)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/70 bg-red-600/90 transition-colors hover:bg-red-500"
              aria-label="Remove media"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`${className} flex flex-col items-center justify-center rounded-lg border-2 bg-black/25 text-red-100 transition-all duration-200 hover:border-red-400 hover:bg-red-950/25 disabled:opacity-50`}
          style={{ borderColor: 'rgba(239, 68, 68, 0.45)' }}
        >
          {uploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-red-400" />
          ) : (
            <>
              <Upload className="mb-2 h-6 w-6" />
              <span className="text-xs font-semibold">Upload</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-red-100/70">
        <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Images</span>
        <span className="inline-flex items-center gap-1"><FileVideo className="h-3.5 w-3.5" /> Videos</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MediaUpload;
