import React from 'react';

interface ImageDisplayProps {
  imageUrl: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl }) => {
  return (
    <div className="mt-4">
      <img src={imageUrl} alt="Generated image" className="max-w-full h-auto rounded-lg shadow-lg" />
    </div>
  );
};

export default ImageDisplay;