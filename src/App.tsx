import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { OutputViewer } from './components/OutputViewer';
import { ImageDetails } from './components/ImageDetails';
import { BatchList } from './components/BatchList';
import { DecoderView } from './components/DecoderView';
import { DeveloperGuide } from './components/DeveloperGuide';
import { ConvertedImage } from './types';
import { processFile, createSampleImage } from './utils/base64';
import { Loader2, Plus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'convert' | 'decode' | 'guide'>('convert');
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Sync dark mode class with root html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load a default sample image on first load so the UI is immediately interactive
  useEffect(() => {
    let isMounted = true;
    createSampleImage('icon').then((sample) => {
      if (isMounted) {
        setImages([sample]);
        setSelectedImageId(sample.id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    try {
      const convertedList: ConvertedImage[] = [];
      for (const file of files) {
        try {
          const converted = await processFile(file);
          convertedList.push(converted);
        } catch (err) {
          console.error(`Failed to process ${file.name}`, err);
        }
      }

      if (convertedList.length > 0) {
        setImages((prev) => [...convertedList, ...prev]);
        setSelectedImageId(convertedList[0].id);
        setActiveTab('convert');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleLoaded = (sample: ConvertedImage) => {
    setImages((prev) => [sample, ...prev]);
    setSelectedImageId(sample.id);
    setActiveTab('convert');
  };

  const handleOptimized = (optimizedImg: ConvertedImage) => {
    setImages((prev) => [optimizedImg, ...prev]);
    setSelectedImageId(optimizedImg.id);
  };

  const handleRemoveImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    if (selectedImageId === id && updated.length > 0) {
      setSelectedImageId(updated[0].id);
    }
  };

  const handleClearAll = () => {
    setImages([]);
    setSelectedImageId('');
  };

  const selectedImage = images.find((img) => img.id === selectedImageId) || images[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Hidden file input for global Header "Upload File" trigger */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFilesSelected(Array.from(e.target.files));
            e.target.value = '';
          }
        }}
      />

      {/* Header conforming to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onUploadClick={() => hiddenFileInputRef.current?.click()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Image to Base64 Converter */}
        {activeTab === 'convert' && (
          <div className="space-y-6">
            {/* If no images uploaded, show prominent DropZone */}
            {images.length === 0 ? (
              <div className="max-w-3xl mx-auto py-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                    Convert Any Image to Base64 String
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-balance">
                    Fast, secure, 100% in-browser processing. Generate Data URIs, HTML image tags, CSS backgrounds, and React snippets ready to copy.
                  </p>
                </div>

                <DropZone
                  onFilesSelected={handleFilesSelected}
                  onSampleLoaded={handleSampleLoaded}
                />
              </div>
            ) : (
              <>
                {/* Compact Add File Bar & Multi-file Batch List */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        Image to Base64 Converter
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {images.length} {images.length === 1 ? 'asset loaded' : 'assets in workspace'} · Client-side processing
                      </p>
                    </div>

                    <button
                      onClick={() => hiddenFileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add More Images</span>
                    </button>
                  </div>

                  {/* Batch Gallery list if > 1 image */}
                  <BatchList
                    images={images}
                    selectedId={selectedImage?.id || ''}
                    onSelect={(id) => setSelectedImageId(id)}
                    onRemove={handleRemoveImage}
                    onClearAll={handleClearAll}
                  />
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Encoding image files to Base64…
                    </p>
                  </div>
                )}

                {/* Active Image Workspace: Visual Preview & Output Viewer */}
                {selectedImage && !isProcessing && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Visual Preview, Specs & Resizer (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                      <ImageDetails
                        image={selectedImage}
                        onOptimized={handleOptimized}
                      />

                      {/* Dropzone compact upload hint */}
                      <DropZone
                        onFilesSelected={handleFilesSelected}
                        onSampleLoaded={handleSampleLoaded}
                        isCompact
                      />
                    </div>

                    {/* Right Column: Code Snippets & Copy Controls (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                      <OutputViewer image={selectedImage} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: Base64 to Image Decoder */}
        {activeTab === 'decode' && (
          <DecoderView
            onSendToConverter={(decoded) => {
              setImages((prev) => [decoded, ...prev]);
              setSelectedImageId(decoded.id);
              setActiveTab('convert');
            }}
          />
        )}

        {/* Tab 3: Developer Reference & Guide */}
        {activeTab === 'guide' && <DeveloperGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-12 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Base64 Studio. All conversions operate locally inside your browser memory.</p>
          <div className="flex items-center gap-4">
            <span>RFC 2397 Data URI</span>
            <span aria-hidden="true">·</span>
            <span>Zero Server Uploads</span>
            <span aria-hidden="true">·</span>
            <span>Privacy-First</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
