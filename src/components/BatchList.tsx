import React, { useState } from 'react';
import { Trash2, Copy, Check, FileCode, Layers } from 'lucide-react';
import { ConvertedImage } from '../types';
import { formatBytes } from '../utils/base64';

interface BatchListProps {
  images: ConvertedImage[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const BatchList: React.FC<BatchListProps> = ({
  images,
  selectedId,
  onSelect,
  onRemove,
  onClearAll,
}) => {
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (images.length <= 1) return null;

  const handleCopyAllAsJson = async () => {
    const payload = images.map((img) => ({
      name: img.name,
      type: img.type,
      width: img.width,
      height: img.height,
      dataUri: img.base64Data,
    }));

    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopySingle = async (e: React.MouseEvent, img: ConvertedImage) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(img.base64Data);
      setCopiedId(img.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Batch Uploads ({images.length} files)
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllAsJson}
            className="px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1.5"
          >
            {copiedBatch ? <Check className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedBatch ? 'Copied JSON!' : 'Copy All as JSON'}</span>
          </button>
          <button
            onClick={onClearAll}
            className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
        {images.map((img) => {
          const isSelected = img.id === selectedId;
          const isCopied = copiedId === img.id;

          return (
            <div
              key={img.id}
              onClick={() => onSelect(img.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center transparency-grid">
                  <img
                    src={img.base64Data}
                    alt={img.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {img.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {formatBytes(img.base64Size)} · {img.width}×{img.height}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={(e) => handleCopySingle(e, img)}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    isCopied
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Copy Data URI"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(img.id);
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
