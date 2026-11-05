import localFont from 'next/font/local';

/*
 * Self-hosted fonts (no request to Google at runtime or build time).
 * Latin files are preloaded. Cyrillic and Thai files are declared with a
 * unicode-range, so browsers only download them on pages that contain those
 * scripts (the Russian and Thai versions).
 */
// Note: next/font options must be literals (statically analyzed at build).

export const display = localFont({
  src: '../assets/fonts/unbounded-latin-wght-normal.woff2',
  weight: '200 900',
  variable: '--nf-display',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

export const displayCyrillic = localFont({
  src: '../assets/fonts/unbounded-cyrillic-wght-normal.woff2',
  weight: '200 900',
  variable: '--nf-display-cyrillic',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116' }],
});

export const text = localFont({
  src: [
    { path: '../assets/fonts/literata-latin-wght-normal.woff2', weight: '200 900', style: 'normal' },
    { path: '../assets/fonts/literata-latin-wght-italic.woff2', weight: '200 900', style: 'italic' },
  ],
  variable: '--nf-text',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const textCyrillic = localFont({
  src: [
    { path: '../assets/fonts/literata-cyrillic-wght-normal.woff2', weight: '200 900', style: 'normal' },
    { path: '../assets/fonts/literata-cyrillic-wght-italic.woff2', weight: '200 900', style: 'italic' },
  ],
  variable: '--nf-text-cyrillic',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116' }],
});

export const displayThai = localFont({
  src: [
    { path: '../assets/fonts/kanit-thai-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/kanit-thai-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--nf-display-thai',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+02D7,U+0303,U+0331,U+0E01-0E5B,U+200C-200D,U+25CC' }],
});

export const textThai = localFont({
  src: '../assets/fonts/noto-serif-thai-thai-wght-normal.woff2',
  weight: '100 900',
  variable: '--nf-text-thai',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+02D7,U+0303,U+0331,U+0E01-0E5B,U+200C-200D,U+25CC' }],
});

export const fontVariables = [display, displayCyrillic, text, textCyrillic, displayThai, textThai]
  .map((f) => f.variable)
  .join(' ');
