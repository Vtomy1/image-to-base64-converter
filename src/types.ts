export interface ConvertedImage {
  id: string;
  name: string;
  originalSize: number;
  type: string;
  width: number;
  height: number;
  base64Data: string; // full data URI: data:image/png;base64,...
  rawBase64: string;  // stripped base64 string
  base64Size: number; // byte size of data URI
  timestamp: number;
  aspectRatio: string;
}

export type SnippetFormat = 
  | 'data-uri'
  | 'raw-base64'
  | 'html-img'
  | 'css-background'
  | 'react-jsx'
  | 'markdown'
  | 'svg-image'
  | 'json';

export type LineWrapOption = 'nowrap' | '76' | '120';

export interface ImageOptimizationSettings {
  maxWidth?: number;
  maxHeight?: number;
  quality: number; // 0.1 to 1.0
  format: 'keep' | 'image/png' | 'image/jpeg' | 'image/webp';
}
