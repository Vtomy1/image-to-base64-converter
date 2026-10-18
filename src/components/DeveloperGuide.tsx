import React, { useState } from 'react';
import { Copy, Check, BookOpen, AlertTriangle, Lightbulb } from 'lucide-react';

export const DeveloperGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const JS_EXAMPLE = `// 1. Convert File to Base64 in Browser JavaScript
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Usage:
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const base64DataUri = await fileToBase64(file);
  console.log(base64DataUri); // "data:image/png;base64,iVBOR..."
});`;

  const NODE_EXAMPLE = `// 2. Read local image to Base64 in Node.js
import fs from 'fs';
import path from 'path';

function imageToBase64(filePath) {
  const ext = path.extname(filePath).replace('.', '');
  const mime = ext === 'svg' ? 'image/svg+xml' : \`image/\${ext}\`;
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  return \`data:\${mime};base64,\${base64Data}\`;
}`;

  const PYTHON_EXAMPLE = `# 3. Image to Base64 in Python
import base64

with open("icon.png", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    data_uri = f"data:image/png;base64,{encoded_string}"
    print(data_uri)`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-semibold tracking-wide uppercase">Engineering Reference</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Base64 Image Encoding & Data URI Guide
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Base64 converts binary image bytes into 64 printable ASCII characters (A-Z, a-z, 0-9, +, /).
          Combined with the RFC 2397 Data URI scheme, images can be directly embedded into HTML, CSS, JavaScript, JSON, or emails without external network requests.
        </p>

        {/* Data URI Syntax Breakdown */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 mb-1">Standard Data URI Structure:</p>
          <div className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 overflow-x-auto py-1">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">data:</span>
            <span className="text-emerald-600 dark:text-emerald-400">image/png</span>
            <span className="text-slate-400">;</span>
            <span className="text-amber-600 dark:text-amber-400">base64</span>
            <span className="text-slate-400">,</span>
            <span className="text-slate-600 dark:text-slate-300">iVBORw0KGgoAAAANSUhEUg...</span>
          </div>
        </div>
      </div>

      {/* When to use vs when NOT to use */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
            <Lightbulb className="w-4 h-4" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Best Use Cases</h4>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <li>• Small UI icons, spinners, and badges under 10–15 KB</li>
            <li>• HTML emails where external image hosts may be blocked</li>
            <li>• Self-contained single-file HTML reports, offline PWAs, and documentation</li>
            <li>• Eliminating initial HTTP roundtrip requests for critical above-the-fold assets</li>
            <li>• Embedding images in JSON API responses without separate asset storage</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Trade-offs & Warnings</h4>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <li>• <strong>+33% Payload Increase</strong>: 3 binary bytes encode into 4 Base64 characters.</li>
            <li>• <strong>No Independent Caching</strong>: Base64 images bundled into HTML or CSS cannot be cached independently by browser CDNs.</li>
            <li>• <strong>DOM & Parsing Cost</strong>: Huge multi-megabyte base64 strings increase DOM memory and page parse time.</li>
            <li>• Tip: Always downscale or compress before encoding! Use the built-in optimizer above.</li>
          </ul>
        </div>
      </div>

      {/* Code Implementations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Code Snippets Across Languages
        </h3>

        {/* Browser JS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Vanilla JavaScript (Browser FileReader)
            </span>
            <button
              onClick={() => copyCode(JS_EXAMPLE, 'js')}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
            >
              {copiedKey === 'js' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'js' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto">
            <pre>{JS_EXAMPLE}</pre>
          </div>
        </div>

        {/* Node.js */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Node.js (Buffer)
            </span>
            <button
              onClick={() => copyCode(NODE_EXAMPLE, 'node')}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
            >
              {copiedKey === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'node' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto">
            <pre>{NODE_EXAMPLE}</pre>
          </div>
        </div>

        {/* Python */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Python (base64 standard library)
            </span>
            <button
              onClick={() => copyCode(PYTHON_EXAMPLE, 'py')}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
            >
              {copiedKey === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'py' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto">
            <pre>{PYTHON_EXAMPLE}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
