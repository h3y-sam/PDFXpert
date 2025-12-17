
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl }) => {
  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" 
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div 
        className="relative max-w-full max-h-full flex items-center justify-center p-2" 
        onClick={e => e.stopPropagation()}
      >
         <img 
            src={imageUrl} 
            alt="Preview" 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10" 
         />
      </div>
    </div>
  );
};

export default ImageModal;
