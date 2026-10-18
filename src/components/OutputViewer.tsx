import React, { useState, useMemo } from 'react';
import {
  Check,
  Copy,
  Download,
  Code2,
  FileText,
  WrapText,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { ConvertedImage, SnippetFormat, LineWrapOption } from '../types';
import { formatBytes, generateSnippet, downloadText } from '../utils/base64';

interface OutputViewerProps {
  image: ConvertedImage;
}

const FORMAT_OPTIONS: { id: SnippetFormat; label: string; desc: string }[] = [
  { id: 'data-uri', label: 'Data URI', desc: 'data:image/...;base64,...' },
  { id: 'raw-base64', label: 'Raw Base64', desc: 'Base64 string only' },
  { id: 'html-img', label: 'HTML <img>', desc: '<img src="data:..." />' },
  { id: 'css-background', label: 'CSS Background', desc: 'background-image: url(...)' },
  { id: 'react-jsx', label: 'React JSX', desc: '<img src={"..."} />' },
  { id: 'markdown', label: 'Markdown', desc: '![alt](data:...)' },
  { id: 'svg-image', label: 'SVG <image>', desc: '<image href="data:..." />' },
  { id: 'json', label: 'JSON Payload', desc: '{ "dataUri": "..." }' },
];

export const OutputViewer: React.FC<OutputViewerProps> = ({ image }) => {
  const [activeFormat, setActiveFormat] = useState<SnippetFormat>('data-uri');
  const [lineWrap, setLineWrap] = useState<LineWrapOption>('nowrap');
  const [showFullString, setShowFullString] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Generate the full snippet
  const fullSnippet = useMemo(() => {
    return generateSnippet(activeFormat, image, lineWrap);
  }, [activeFormat, image, lineWrap]);

  // Truncate display for huge strings so UI doesn't stutter, but copy still takes 100% of the string
  const displaySnippet = useMemo(() => {
    if (showFullString || fullSnippet.length <= 4000) {
      return fullSnippet;
    }
    const head = fullSnippet.slice(0, 1800);
    const tail = fullSnippet.slice(-1200);
    const hiddenCount = fullSnippet.length - 3000;
    return `${head}\n\n/* ... [${hiddenCount.toLocaleString()} characters hidden in viewer for performance. Full text will be copied] ... */\n\n${tail}`;
  }, [fullSnippet, showFullString]);

  const copyToClipboard = async (text: string, formatId: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older or insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedFormat(formatId);
      setTimeout(() => setCopiedFormat(null), 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadTxt = () => {
    const filename = `${image.name.replace(/\.[^/.]+$/, '')}-${activeFormat}.txt`;
    downloadText(fullSnippet, filename);
  };

  const overheadPercent = Math.max(
    0,
    Math.round(((image.base64Size - image.originalSize) / Math.max(1, image.originalSize)) * 100)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      {/* Metrics & Metadata Bar */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <div>
              <span className="text-slate-400 dark:text-slate-500">File: </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] inline-block align-bottom">
                {image.name}
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Original: </span>
              <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                {formatBytes(image.originalSize)}
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Base64: </span>
              <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                {formatBytes(image.base64Size)}
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Length: </span>
              <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                {image.base64Data.length.toLocaleString()} chars
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <div title="Standard Base64 encoding overhead is ~33%">
              <span className="text-slate-400 dark:text-slate-500">Overhead: </span>
              <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400 font-medium">
                +{overheadPercent}%
              </span>
            </div>
          </div>

          {/* Quick Raw & Data URI Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(image.rawBase64, 'quick-raw')}
              className="px-2.5 py-1 text-xs font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              {copiedFormat === 'quick-raw' ? '✓ Copied Raw' : 'Copy Raw Only'}
            </button>
            <button
              onClick={() => copyToClipboard(image.base64Data, 'quick-data-uri')}
              className="px-2.5 py-1 text-xs font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              {copiedFormat === 'quick-data-uri' ? '✓ Copied URI' : 'Copy Data URI'}
            </button>
          </div>
        </div>
      </div>

      {/* Snippet Format Selector Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setActiveFormat(fmt.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                  activeFormat === fmt.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={fmt.desc}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          {/* Controls: Wrapping & Text file export */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
                <WrapText className="w-3 h-3" /> Wrap:
              </span>
              <button
                onClick={() => setLineWrap('nowrap')}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  lineWrap === 'nowrap'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Off
              </button>
              <button
                onClick={() => setLineWrap('76')}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  lineWrap === '76'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="RFC 2045 standard MIME wrap (76 characters)"
              >
                76
              </button>
              <button
                onClick={() => setLineWrap('120')}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  lineWrap === '120'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                120
              </button>
            </div>

            <button
              onClick={handleDownloadTxt}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Download string as .txt file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save .txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer Area */}
      <div className="relative">
        {/* Floating Master Copy Button */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {fullSnippet.length > 4000 && (
            <button
              onClick={() => setShowFullString(!showFullString)}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-1.5 shadow-sm"
              title={showFullString ? 'Truncate viewer' : 'Expand full string'}
            >
              {showFullString ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show All</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => copyToClipboard(fullSnippet, 'master-copy')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 active:scale-98 ${
              copiedFormat === 'master-copy'
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {copiedFormat === 'master-copy' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy {FORMAT_OPTIONS.find((f) => f.id === activeFormat)?.label}</span>
              </>
            )}
          </button>
        </div>

        {/* Text code box */}
        <div className="max-h-72 sm:max-h-96 overflow-y-auto bg-slate-950 p-4 sm:p-5 pt-12 sm:pt-14 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed scrollbar-thin select-all">
          <pre className="whitespace-pre-wrap break-all">{displaySnippet}</pre>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>
            Ready to paste in <code className="text-slate-700 dark:text-slate-300 font-mono">src=""</code>, CSS files, emails, or API payloads.
          </span>
        </div>
        <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500">
          Format: {activeFormat} · {lineWrap === 'nowrap' ? 'Single line' : `Wrapped ${lineWrap}ch`}
        </span>
      </div>
    </div>
  );
};
