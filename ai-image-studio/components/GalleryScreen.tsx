
import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { useLucide } from '../hooks/useLucide';
import { Icons } from './Icons';
import IconButton from './IconButton';
import ActionButton from './ActionButton';

interface GalleryScreenProps {
  gallery: GalleryItem[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onViewInGenerator: (src: string, prompt: string) => void;
}

const GalleryScreen: React.FC<GalleryScreenProps> = ({ gallery, onClose, onDelete, onViewInGenerator }) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  useLucide([gallery, selectedItem]);

  const handleViewAndClose = (item: GalleryItem) => {
    onViewInGenerator(item.src, item.prompt);
    onClose();
  };

  const handleDeleteAndClose = (id: string) => {
    onDelete(id);
    setSelectedItem(null);
  };

  if (selectedItem) {
    return (
      <div className="flex h-full w-full flex-col bg-black">
        <header className="flex-shrink-0 flex justify-between items-center p-4 z-10">
          <IconButton onClick={() => setSelectedItem(null)} title="Back to Gallery"><Icons.BackIcon /></IconButton>
          <h2 className="text-lg font-bold">Details</h2>
          <div className="w-10"></div>
        </header>
        <main className="flex-1 flex items-center justify-center min-h-0">
          <img src={selectedItem.src} alt={selectedItem.prompt} className="max-h-full max-w-full object-contain" />
        </main>
        <p className="flex-shrink-0 p-4 text-center text-sm text-slate-400 max-h-24 overflow-y-auto">{selectedItem.prompt}</p>
        <footer className="flex-shrink-0 flex justify-around items-center p-2 bg-black/30">
          <ActionButton onClick={() => handleViewAndClose(selectedItem)} title="View in Generator">
            <Icons.ViewInGeneratorIcon /><span>Remix</span>
          </ActionButton>
          <ActionButton onClick={() => handleDeleteAndClose(selectedItem.id)} title="Delete">
            <Icons.DeleteIcon /><span>Delete</span>
          </ActionButton>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col p-4 pt-5 gap-4 bg-slate-900">
      <header className="flex-shrink-0 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">My Gallery</h1>
        <IconButton onClick={onClose} title="Close gallery"><Icons.CloseIcon /></IconButton>
      </header>
      {gallery.length === 0 ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-slate-500">Your saved images will appear here.</p></div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((item) => (
              <div key={item.id} className="group relative aspect-square cursor-pointer" onClick={() => setSelectedItem(item)}>
                <img src={item.src} alt={item.prompt} className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-md"></div>
                <p className="absolute bottom-1 left-1.5 right-1.5 text-white text-[10px] leading-tight line-clamp-2 font-medium pointer-events-none">{item.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryScreen;
