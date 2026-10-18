import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Clipboard, Sparkles } from 'lucide-react';
import { createSampleImage } from '../utils/base64';
import { ConvertedImage } from '../types';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onSampleLoaded: (image: ConvertedImage) => void;
  isCompact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onSampleLoaded,
  isCompact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  // Global paste handler so user can hit Ctrl+V anywhere
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif|avif|bmp|ico)$/i.test(file.name)
      );
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      // Reset input value to allow selecting same file again if desired
      e.target.value = '';
    }
  };

  const handleLoadSample = async (type: 'icon' | 'badge' | 'gradient') => {
    setLoadingSample(type);
    try {
      const sample = await createSampleImage(type);
      onSampleLoaded(sample);
    } finally {
      setLoadingSample(null);
    }
  };

  if (isCompact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer border border-dashed rounded-xl p-4 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Add more image files or drop them here</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-150 ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 ring-4 ring-indigo-500/10'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto pointer-events-none">
          <div className="w-14 h-14 mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Drop your image here, or{' '}
            <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-4">
              browse files
            </span>
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-balance">
            Supports PNG, JPEG, SVG, WebP, GIF, AVIF, BMP, and ICO. Files are processed entirely client-side inside your browser for maximum privacy.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clipboard className="w-3.5 h-3.5" /> Paste with <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]">⌘V</kbd>
            </span>
            <span aria-hidden="true">·</span>
            <span>Batch uploads supported</span>
          </div>
        </div>
      </div>

      {/* Preset demo assets for instant testing */}
      <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Quick test presets:
        </span>
        <button
          type="button"
          onClick={() => handleLoadSample('icon')}
          disabled={loadingSample !== null}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          {loadingSample === 'icon' ? 'Loading…' : 'App Icon (PNG)'}
        </button>
        <button
          type="button"
          onClick={() => handleLoadSample('badge')}
          disabled={loadingSample !== null}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          {loadingSample === 'badge' ? 'Loading…' : 'Vector Badge'}
        </button>
        <button
          type="button"
          onClick={() => handleLoadSample('gradient')}
          disabled={loadingSample !== null}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          {loadingSample === 'gradient' ? 'Loading…' : 'Banner Graphic'}
        </button>
      </div>
    </div>
  );
};
