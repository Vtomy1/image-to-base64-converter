import React, { useState } from 'react';
import { Download, ArrowRight, AlertCircle, Copy, Check, FileImage, Sparkles } from 'lucide-react';
import { parseBase64Input, downloadBase64Image, formatBytes } from '../utils/base64';
import { ConvertedImage } from '../types';

interface DecoderViewProps {
  onSendToConverter: (img: ConvertedImage) => void;
}

export const DecoderView: React.FC<DecoderViewProps> = ({ onSendToConverter }) => {
  const [inputText, setInputText] = useState('');
  const [decodedImage, setDecodedImage] = useState<ConvertedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDecode = async (str: string = inputText) => {
    if (!str.trim()) {
      setError('Please enter or paste a Base64 string or Data URI');
      setDecodedImage(null);
      return;
    }

    setIsDecoding(true);
    setError(null);

    try {
      const result = await parseBase64Input(str);
      setDecodedImage(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to decode Base64 string into a valid image.');
      setDecodedImage(null);
    } finally {
      setIsDecoding(false);
    }
  };

  const handleDownload = () => {
    if (!decodedImage) return;
    const ext = decodedImage.type.split('/')[1]?.split('+')[0] || 'png';
    downloadBase64Image(decodedImage.base64Data, `decoded-image.${ext}`);
  };

  const handleCopyUri = async () => {
    if (!decodedImage) return;
    try {
      await navigator.clipboard.writeText(decodedImage.base64Data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasteDemo = () => {
    // 1x1 transparent png or sample red dot
    const demo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    setInputText(demo);
    handleDecode(demo);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Base64 to Image Decoder
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Paste any raw Base64 string or Data URI to inspect, preview, and download the decoded image file.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasteDemo}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Try sample 5×5 dot
          </button>
        </div>

        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste raw Base64 (e.g. iVBORw0KGgo...) or Data URI (e.g. data:image/png;base64,...)"
            rows={5}
            className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {inputText.length > 0 ? `${inputText.length.toLocaleString()} characters` : 'Empty input'}
            </span>
            <div className="flex items-center gap-2">
              {inputText.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setDecodedImage(null);
                    setError(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDecode()}
                disabled={isDecoding || !inputText.trim()}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-lg shadow-xs transition-all disabled:opacity-50"
              >
                {isDecoding ? 'Decoding…' : 'Decode & Preview Image'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decoded Result */}
      {decodedImage && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Decoded Image Output
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUri}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied URI' : 'Copy Data URI'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>
              <button
                onClick={() => onSendToConverter(decodedImage)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Send to main converter with all snippet formats"
              >
                <span>Full Snippets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-100/50 dark:bg-slate-950/50 flex items-center justify-center min-h-[220px]">
            <div className="transparency-grid rounded-xl p-3 border border-slate-200 dark:border-slate-800 max-w-full">
              <img
                src={decodedImage.base64Data}
                alt="Decoded result"
                className="max-h-72 object-contain rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
            <div className="p-3">
              <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Dimensions</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                {decodedImage.width} × {decodedImage.height} px
              </span>
            </div>
            <div className="p-3">
              <span className="block text-slate-400 dark:text-slate-500 mb-0.5">MIME Type</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {decodedImage.type}
              </span>
            </div>
            <div className="p-3">
              <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Base64 Size</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                {formatBytes(decodedImage.base64Size)}
              </span>
            </div>
            <div className="p-3">
              <span className="block text-slate-400 dark:text-slate-500 mb-0.5">Approx. Binary Size</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                {formatBytes(decodedImage.originalSize)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
