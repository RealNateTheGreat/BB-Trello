import React from 'react';
import { ImageOff } from 'lucide-react';

interface NoPreviewImageProps {
  className?: string;
}

const NoPreviewImage: React.FC<NoPreviewImageProps> = ({ className = "w-24 h-24" }) => {
  return (
    <div 
      className={`${className} rounded-lg border-2 border-amber-700/50 flex flex-col items-center justify-center`}
      style={{ backgroundColor: 'rgba(74, 55, 40, 0.3)' }}
    >
      <ImageOff className="w-8 h-8 text-amber-400/60 mb-1" />
      <span className="text-amber-400/60 text-xs font-medium text-center leading-tight">
        No Preview<br />Available
      </span>
    </div>
  );
};

export default NoPreviewImage;