import { ConvertedImage, SnippetFormat, LineWrapOption, ImageOptimizationSettings } from '../types';

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function extractRawBase64(dataUri: string): { raw: string; mimeType: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.*)$/s);
  if (match) {
    return { mimeType: match[1], raw: match[2] };
  }
  // If it's already raw
  return { mimeType: 'image/png', raw: dataUri };
}

export function calculateBase64ByteSize(base64Str: string): number {
  return new Blob([base64Str]).size;
}

export function wrapString(str: string, wrap: LineWrapOption): string {
  if (wrap === 'nowrap') return str;
  const len = wrap === '76' ? 76 : 120;
  const regex = new RegExp(`.{1,${len}}`, 'g');
  const chunks = str.match(regex);
  return chunks ? chunks.join('\n') : str;
}

export async function processFile(file: File): Promise<ConvertedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUri = reader.result as string;
      const { raw, mimeType } = extractRawBase64(dataUri);

      // Load into HTMLImage to get natural dimensions
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || 100;
        const height = img.naturalHeight || 100;
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(width, height);
        const aspectRatio = divisor > 0 ? `${width / divisor}:${height / divisor}` : `${width}:${height}`;

        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          originalSize: file.size,
          type: mimeType || file.type || 'image/png',
          width,
          height,
          base64Data: dataUri,
          rawBase64: raw,
          base64Size: calculateBase64ByteSize(dataUri),
          timestamp: Date.now(),
          aspectRatio,
        });
      };

      img.onerror = () => {
        // Fallback if image dimensions can't be parsed directly (e.g., some raw SVGs)
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          originalSize: file.size,
          type: mimeType || file.type || 'image/png',
          width: 0,
          height: 0,
          base64Data: dataUri,
          rawBase64: raw,
          base64Size: calculateBase64ByteSize(dataUri),
          timestamp: Date.now(),
          aspectRatio: 'unknown',
        });
      };

      img.src = dataUri;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function generateSnippet(
  format: SnippetFormat,
  img: ConvertedImage,
  wrap: LineWrapOption = 'nowrap'
): string {
  const dataUri = wrapString(img.base64Data, wrap);
  const rawBase64 = wrapString(img.rawBase64, wrap);
  const safeName = img.name.replace(/"/g, '&quot;');

  switch (format) {
    case 'data-uri':
      return dataUri;

    case 'raw-base64':
      return rawBase64;

    case 'html-img':
      return `<img src="${dataUri}" alt="${safeName}" width="${img.width}" height="${img.height}" />`;

    case 'css-background':
      return `.element {\n  background-image: url("${dataUri}");\n  background-size: cover;\n  background-repeat: no-repeat;\n}`;

    case 'react-jsx':
      return `<img\n  src="${dataUri}"\n  alt="${safeName}"\n  width={${img.width}}\n  height={${img.height}}\n/>`;

    case 'markdown':
      return `![${safeName}](${dataUri})`;

    case 'svg-image':
      return `<image\n  href="${dataUri}"\n  width="${img.width}"\n  height="${img.height}"\n/>`;

    case 'json':
      return JSON.stringify(
        {
          filename: img.name,
          mimeType: img.type,
          width: img.width,
          height: img.height,
          originalBytes: img.originalSize,
          base64Bytes: img.base64Size,
          dataUri: img.base64Data,
        },
        null,
        2
      );

    default:
      return dataUri;
  }
}

export async function optimizeImage(
  img: ConvertedImage,
  settings: ImageOptimizationSettings
): Promise<ConvertedImage> {
  return new Promise((resolve, reject) => {
    const htmlImg = new Image();
    htmlImg.onload = () => {
      let targetWidth = img.width;
      let targetHeight = img.height;

      if (settings.maxWidth && targetWidth > settings.maxWidth) {
        const ratio = settings.maxWidth / targetWidth;
        targetWidth = settings.maxWidth;
        targetHeight = Math.round(targetHeight * ratio);
      }

      if (settings.maxHeight && targetHeight > settings.maxHeight) {
        const ratio = settings.maxHeight / targetHeight;
        targetHeight = settings.maxHeight;
        targetWidth = Math.round(targetWidth * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      // Preserve clean smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(htmlImg, 0, 0, targetWidth, targetHeight);

      const targetMime = settings.format === 'keep' ? img.type : settings.format;
      const quality = settings.quality;

      const newDataUri = canvas.toDataURL(targetMime, quality);
      const { raw } = extractRawBase64(newDataUri);
      const base64Bytes = calculateBase64ByteSize(newDataUri);
      const approxOriginal = Math.round(base64Bytes * 0.75);

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(targetWidth, targetHeight);
      const aspectRatio = divisor > 0 ? `${targetWidth / divisor}:${targetHeight / divisor}` : `${targetWidth}:${targetHeight}`;

      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: `optimized-${img.name.replace(/\.[^/.]+$/, '')}.${targetMime.split('/')[1] || 'png'}`,
        originalSize: approxOriginal,
        type: targetMime,
        width: targetWidth,
        height: targetHeight,
        base64Data: newDataUri,
        rawBase64: raw,
        base64Size: base64Bytes,
        timestamp: Date.now(),
        aspectRatio,
      });
    };

    htmlImg.onerror = (err) => reject(err);
    htmlImg.src = img.base64Data;
  });
}

export async function parseBase64Input(inputStr: string): Promise<ConvertedImage> {
  const trimmed = inputStr.trim();
  let fullDataUri = trimmed;

  if (!trimmed.startsWith('data:image/')) {
    // Attempt to guess MIME or default to image/png
    if (trimmed.startsWith('/9j/')) {
      fullDataUri = `data:image/jpeg;base64,${trimmed}`;
    } else if (trimmed.startsWith('iVBORw0KGgo')) {
      fullDataUri = `data:image/png;base64,${trimmed}`;
    } else if (trimmed.startsWith('R0lGOD')) {
      fullDataUri = `data:image/gif;base64,${trimmed}`;
    } else if (trimmed.startsWith('UklGR')) {
      fullDataUri = `data:image/webp;base64,${trimmed}`;
    } else if (trimmed.startsWith('PHN2Zy') || trimmed.startsWith('PD94bWw')) {
      fullDataUri = `data:image/svg+xml;base64,${trimmed}`;
    } else {
      fullDataUri = `data:image/png;base64,${trimmed}`;
    }
  }

  const { raw, mimeType } = extractRawBase64(fullDataUri);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || 100;
      const height = img.naturalHeight || 100;
      const base64Bytes = calculateBase64ByteSize(fullDataUri);
      const originalApprox = Math.round(base64Bytes * 0.75);

      const ext = mimeType.split('/')[1]?.split('+')[0] || 'png';
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: `decoded-image.${ext}`,
        originalSize: originalApprox,
        type: mimeType,
        width,
        height,
        base64Data: fullDataUri,
        rawBase64: raw,
        base64Size: base64Bytes,
        timestamp: Date.now(),
        aspectRatio: `${width}:${height}`,
      });
    };

    img.onerror = () => {
      reject(new Error('Invalid Base64 image data. Could not decode into an image.'));
    };

    img.src = fullDataUri;
  });
}

export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadBase64Image(dataUri: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUri;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function createSampleImage(type: 'icon' | 'badge' | 'gradient'): Promise<ConvertedImage> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  if (type === 'icon') {
    canvas.width = 128;
    canvas.height = 128;
    // Transparent background with rounded symbol
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.roundRect(16, 16, 96, 96, 24);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('64', 64, 66);
  } else if (type === 'badge') {
    canvas.width = 240;
    canvas.height = 80;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 240, 80);

    const grad = ctx.createLinearGradient(0, 0, 240, 0);
    grad.addColorStop(0, '#38BDF8');
    grad.addColorStop(1, '#818CF8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(40, 40, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VERIFIED ASSET', 75, 46);
  } else {
    canvas.width = 400;
    canvas.height = 300;
    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    grad.addColorStop(0, '#4F46E5');
    grad.addColorStop(0.5, '#06B6D4');
    grad.addColorStop(1, '#10B981');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sample Artwork', 200, 140);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('400 × 300 px · Ready for Base64', 200, 175);
  }

  const dataUri = canvas.toDataURL('image/png');
  const { raw } = extractRawBase64(dataUri);
  const size = calculateBase64ByteSize(dataUri);

  return Promise.resolve({
    id: `sample-${type}-${Date.now()}`,
    name: `sample-${type}.png`,
    originalSize: Math.round(size * 0.75),
    type: 'image/png',
    width: canvas.width,
    height: canvas.height,
    base64Data: dataUri,
    rawBase64: raw,
    base64Size: size,
    timestamp: Date.now(),
    aspectRatio: `${canvas.width}:${canvas.height}`,
  });
}
