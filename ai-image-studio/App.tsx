
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import firebaseService from './services/firebaseService';
import { imageUtils } from './services/imageUtils';
import GeneratorScreen from './components/GeneratorScreen';
import GalleryScreen from './components/GalleryScreen';
import Spinner from './components/Spinner';
import { GalleryItem, GeneratorInitialState, View } from './types';

function App() {
  const [currentView, setCurrentView] = useState<View>('generator');
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [generatorInput, setGeneratorInput] = useState<GeneratorInitialState>({});
  const { userId, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (userId) {
      const unsubscribe = firebaseService.listenToCollection(userId, 'characters', (data) => {
        setGallery(data);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const handleSave = useCallback(async (imageUrl: string, prompt: string) => {
    if (!userId || !imageUrl) return;
    try {
      const compressedSrc = await imageUtils.compressImage(imageUrl);
      await firebaseService.saveCharacter(userId, prompt, compressedSrc);
      alert("Image saved to gallery!");
    } catch (error: any) {
      console.error("Failed to save image:", error);
      alert(`Save failed: ${error.message}`);
    }
  }, [userId]);

  const handleDelete = useCallback(async (id: string) => {
    if (!userId) return;
    try {
      await firebaseService.deleteCharacter(userId, id);
    } catch (error) {
      console.error(`Failed to delete item ${id}: `, error);
    }
  }, [userId]);

  const handleViewInGenerator = useCallback((image: string, prompt: string) => {
    setGeneratorInput({ image, prompt });
    setCurrentView('generator');
  }, []);

  if (isAuthLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-950">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 font-sans text-white overflow-hidden">
      {currentView === 'generator' && (
        <GeneratorScreen
          onSaveImage={handleSave}
          initialState={generatorInput}
          onClearInitialState={() => setGeneratorInput({})}
          onShowGallery={() => setCurrentView('gallery')}
          galleryImageCount={gallery.length}
        />
      )}
      {currentView === 'gallery' && (
        <GalleryScreen
          gallery={gallery}
          onClose={() => setCurrentView('generator')}
          onDelete={handleDelete}
          onViewInGenerator={handleViewInGenerator}
        />
      )}
    </div>
  );
}

export default App;
