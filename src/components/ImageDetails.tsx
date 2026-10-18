import React, { useState } from 'react';
import {
  Download,
  Sliders,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ConvertedImage, ImageOptimizationSettings } from '../types';
import { formatBytes, optimizeImage, downloadBase64Image } from '../utils/base64';

interface ImageDetailsProps {
  image: ConvertedImage;
  onOptimized: (optimizedImg: ConvertedImage) => void;
}

export const ImageDetails: React.FC<ImageDetailsProps> = ({ image, onOptimized }) => {
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [zoomMode, setZoomMode] = useState<'fit' | 'actual'>('fit');
  const [isProcessing, setIsProcessing] = useState(false);

  // Optimizer state
  const [maxWidth, setMaxWidth] = useState<number>(Math.min(image.width || 800, 800));
  const [quality, setQuality] = useState<number>(0.85);
  const [targetFormat, setTargetFormat] = useState<'keep' | 'image/png' | 'image/jpeg' | 'image/webp'>('keep');

  const handleRunOptimization = async () => {
    setIsProcessing(true);
    try {
      const settings: ImageOptimizationSettings = {
        maxWidth: maxWidth > 0 ? maxWidth : undefined,
        quality,
        format: targetFormat,
      };
      const result = await optimizeImage(image, settings);
      onOptimized(result);
    } catch (err) {
      console.error('Optimization failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadImage = () => {
    const ext = image.type.split('/')[1]?.split('+')[0] || 'png';
    const filename = image.name.endsWith(`.${ext}`) ? image.name : `${image.name}.${ext}`;
    downloadBase64Image(image.base64Data, filename);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Visual Preview & Specs</span>
        </h4>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomMode(zoomMode === 'fit' ? 'actual' : 'fit')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={zoomMode === 'fit' ? 'View actual 1:1 size' : 'Fit to container'}
          >
            {zoomMode === 'fit' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownloadImage}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Download decoded image file"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowOptimizer(!showOptimizer)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              showOptimizer
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Resize & Compress</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="p-4 sm:p-6 bg-slate-100/50 dark:bg-slate-950/50 flex flex-col items-center justify-center min-h-[260px] max-h-[420px] overflow-auto">
        <div className="transparency-grid rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center max-w-full">
          <img
            src={image.base64Data}
            alt={image.name}
            className={`rounded max-h-72 object-contain transition-all duration-150 ${
              zoomMode === 'fit' ? 'max-w-full h-auto' : 'w-auto h-auto'
            }`}
          />
        </div>
      </div>

      {/* Specification Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
        <div className="p-3">
          <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Dimensions</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            {image.width > 0 ? `${image.width} × ${image.height} px` : 'Scalable / Vector'}
          </span>
        </div>
        <div className="p-3">
          <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Aspect Ratio</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            {image.aspectRatio}
          </span>
        </div>
        <div className="p-3">
          <span className="block text-slate-400 dark:text-slate-500 mb-0.5">MIME Type</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {image.type}
          </span>
        </div>
        <div className="p-3">
          <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Base64 Size</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            {formatBytes(image.base64Size)}
          </span>
        </div>
      </div>

      {/* Optional Optimization Drawer */}
      {showOptimizer && (
        <div className="p-4 sm:p-5 bg-indigo-50/40 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Reduce Base64 Payload Size</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Downscaling shrinks string length drastically
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Max Width */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Max Width: <span className="font-mono tabular-nums">{maxWidth}px</span>
              </label>
              <input
                type="range"
                min="64"
                max={Math.max(image.width || 1200, 1600)}
                step="32"
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>64px</span>
                <span>{image.width}px original</span>
              </div>
            </div>

            {/* Target Format */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Output Format:
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as any)}
                className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs"
              >
                <option value="keep">Keep Original ({image.type})</option>
                <option value="image/webp">WebP (Optimal compression)</option>
                <option value="image/jpeg">JPEG (Photos)</option>
                <option value="image/png">PNG (Lossless & Alpha)</option>
              </select>
            </div>

            {/* Quality Slider */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Compression Quality: <span className="font-mono tabular-nums">{Math.round(quality * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>20% (Compact)</span>
                <span>100% (High)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunOptimization}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-lg shadow-xs transition-all flex items-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Optimizing…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Compressed Base64</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
