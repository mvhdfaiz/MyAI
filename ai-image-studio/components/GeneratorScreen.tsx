
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AspectRatio, GeneratorInitialState, LoadingState, UploadedFile } from '../types';
import { ASPECT_RATIO_OPTIONS, DEFAULT_NEGATIVE_PROMPT } from '../constants';
import { geminiService } from '../services/geminiService';
import { useLucide } from '../hooks/useLucide';
import { Icons } from './Icons';
import IconButton from './IconButton';
import Spinner from './Spinner';

interface GeneratorScreenProps {
  onSaveImage: (imageUrl: string, prompt: string) => void;
  initialState: GeneratorInitialState;
  onClearInitialState: () => void;
  onShowGallery: () => void;
  galleryImageCount: number;
}

const GeneratorScreen: React.FC<GeneratorScreenProps> = ({ onSaveImage, initialState, onClearInitialState, onShowGallery, galleryImageCount }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('IDLE');
  const [loadingMessage, setLoadingMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useLucide([loadingState, generatedImages, selectedGeneratedImage, uploadedImage, galleryImageCount]);

  useEffect(() => {
    if (initialState.image || initialState.prompt) {
      if (initialState.image) {
        fetch(initialState.image)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `gallery-image.png`, { type: blob.type });
            setUploadedImage({ url: initialState.image!, file });
            setGeneratedImages([]);
            setSelectedGeneratedImage(null);
          });
      }
      if (initialState.prompt) {
        setPrompt(initialState.prompt);
      }
      onClearInitialState();
    }
  }, [initialState, onClearInitialState]);
  
  const handleGenerate = useCallback(async (basePrompt: string, numImages = 4) => {
    if (!basePrompt.trim() || loadingState !== 'IDLE') return;
    setLoadingState('GENERATING');
    setLoadingMessage(numImages === 1 ? "Enhancing..." : `Generating ${numImages}...`);
    setGeneratedImages([]);
    setSelectedGeneratedImage(null);
    try {
      const results = await geminiService.generateImages(basePrompt, DEFAULT_NEGATIVE_PROMPT, aspectRatio, numImages);
      if (results) setGeneratedImages(results);
    } catch (error: any) {
      console.error("Image generation failed:", error);
      alert(`Generation failed: ${error.message}`);
    } finally {
      setLoadingState('IDLE');
    }
  }, [aspectRatio, loadingState]);

  const handleEnhance = async (imageToEnhance: string) => {
    if (loadingState !== 'IDLE') return;
    setLoadingState('ENHANCING');
    setLoadingMessage("Enhancing image...");
    setSelectedGeneratedImage(null);
    setGeneratedImages([]);
    try {
      const result = await geminiService.enhanceImage(imageToEnhance, prompt, aspectRatio, DEFAULT_NEGATIVE_PROMPT);
      if (result && result.images && result.images.length > 0) {
        setGeneratedImages(result.images);
        setSelectedGeneratedImage(result.images[0]);
        setPrompt(result.newPrompt);
      }
    } catch (error: any) {
      console.error("Image enhancement failed:", error);
      alert(`Enhancement failed: ${error.message}`);
    } finally {
      setLoadingState('IDLE');
    }
  };
  
  const handleEnhanceUploadedImage = async () => {
    if (!uploadedImage || loadingState !== 'IDLE') return;
    const reader = new FileReader();
    reader.readAsDataURL(uploadedImage.file);
    reader.onload = () => {
      handleEnhance(reader.result as string);
    };
    reader.onerror = (error) => {
      console.error("Error reading file for enhancement:", error);
      alert("Could not read the uploaded image to enhance it.");
    };
  };

  const handleVariations = () => handleGenerate(prompt, 4);

  const handleAnalyze = async () => {
    if (!uploadedImage || loadingState !== 'IDLE') return;
    setLoadingState('ANALYZING');
    setLoadingMessage("Analyzing...");
    try {
      const analysisResult = await geminiService.analyzeImage(uploadedImage.file);
      if (analysisResult) setPrompt(analysisResult);
    } catch (error: any) {
      console.error("Image analysis failed:", error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setLoadingState('IDLE');
    }
  };

  const handleInspire = async () => {
    if (loadingState !== 'IDLE') return;
    setLoadingState('INSPIRING');
    setLoadingMessage("Getting inspiration...");
    try {
      const creativePrompt = await geminiService.generateCreativePrompt();
      if (creativePrompt) setPrompt(creativePrompt);
    } catch (error: any) {
      console.error("Failed to get creative prompt:", error);
      alert(`Inspire failed: ${error.message}`);
    } finally {
      setLoadingState('IDLE');
    }
  };

  const handleSaveAll = async () => {
    if (generatedImages.length === 0) return;
    await Promise.all(generatedImages.map(img => onSaveImage(img, prompt)));
    alert(`${generatedImages.length} image(s) saved!`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage({ file, url: URL.createObjectURL(file) });
      setGeneratedImages([]);
      setSelectedGeneratedImage(null);
      setPrompt('');
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderMainContent = () => {
    if (selectedGeneratedImage) {
      return (
        <div className="relative h-full w-full flex items-center justify-center">
          <img src={selectedGeneratedImage} alt="Selected generated art" className="h-full w-full object-contain" />
          <div className="absolute top-2 left-2 flex gap-2">
            <IconButton onClick={() => setSelectedGeneratedImage(null)} title="Back to grid"><Icons.BackIcon /></IconButton>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-sm p-2 rounded-xl">
            <IconButton onClick={() => onSaveImage(selectedGeneratedImage, prompt)} title="Save Image"><Icons.SaveIcon /></IconButton>
            <IconButton onClick={() => handleEnhance(selectedGeneratedImage)} title="Enhance Image"><Icons.EnhanceIcon /></IconButton>
            <IconButton onClick={handleVariations} title="Generate Variations"><Icons.VariationsIcon /></IconButton>
          </div>
        </div>
      );
    }
    if (loadingState !== 'IDLE' && loadingState !== 'ANALYZING') {
        return <div className="flex h-full w-full items-center justify-center"><Spinner /></div>;
    }
    if (generatedImages.length > 0) {
      return (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
          {generatedImages.map((img, index) => (
            <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedGeneratedImage(img)}>
              <img src={img} alt={`Generated art ${index + 1}`} className="h-full w-full object-cover rounded-lg transition-all group-hover:brightness-110" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"><Icons.MaximizeIcon /></div>
            </div>
          ))}
        </div>
      );
    }
    if (uploadedImage) {
      return (
        <div className="relative h-full w-full flex items-center justify-center group">
          <img src={uploadedImage.url} alt="Uploaded for analysis" className="h-full w-full object-contain rounded-lg" />
          {loadingState === 'ANALYZING' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"><Spinner/></div>}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton onClick={clearUpload} title="Remove Image" className="bg-red-600/80 hover:bg-red-500"><Icons.CloseIcon /></IconButton>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50">
        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <Icons.UploadIcon />
          <span className="font-semibold">Upload Image</span>
        </button>
      </div>
    );
  };

  const hasTopAction = generatedImages.length > 0 && !selectedGeneratedImage;

  return (
    <div className="flex h-full w-full flex-col p-4 pt-5 gap-4">
      <header className="flex-shrink-0 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">AI Image Studio</h1>
        <div className="relative">
          <IconButton onClick={onShowGallery} title="Open Gallery">
            <Icons.GalleryIcon />
          </IconButton>
          {galleryImageCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">{galleryImageCount}</span>}
        </div>
      </header>
      <main className="flex-1 flex flex-col min-h-0 relative">
        {hasTopAction && (
          <div className="absolute top-2 right-2 z-10">
            <IconButton onClick={handleSaveAll} title="Save all 4 images"><Icons.SaveAllIcon /></IconButton>
          </div>
        )}
        {renderMainContent()}
      </main>
      <section className="flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your vision..."
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
            rows={2}
            aria-label="Image generation prompt"
          />
          <IconButton onClick={handleInspire} disabled={loadingState !== 'IDLE'} title="Inspire Me"><Icons.SparklesIcon /></IconButton>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <IconButton onClick={handleEnhanceUploadedImage} disabled={loadingState !== 'IDLE' || !uploadedImage} title="Enhance Uploaded Image"><Icons.EnhanceIcon /></IconButton>
          <IconButton onClick={handleAnalyze} disabled={loadingState !== 'IDLE' || !uploadedImage} title="Analyze Image"><Icons.AnalyzeIcon /></IconButton>
          <div className="col-span-2">
            <button onClick={() => handleGenerate(prompt)} disabled={loadingState !== 'IDLE' || !prompt.trim()} className="flex h-full w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-800 disabled:opacity-70">
              {loadingState !== 'IDLE' ? loadingMessage : 'Generate'}
            </button>
          </div>
        </div>
      </section>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
    </div>
  );
};

export default GeneratorScreen;
