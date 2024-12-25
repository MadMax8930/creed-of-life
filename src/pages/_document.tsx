import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      {/* Meta tags for SEO */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Creed of Life: A journey of personal growth, embracing confidence, discipline, and adaptability to create a life of purpose, meaning, and transformation." />
      <meta name="keywords" content="Creed of Life, personal growth, confidence, discipline, adaptability, self-awareness, resilience, action, behavior, emotional balance, self-improvement, guide, philosophy, psychology, deep thoughts, meaning of life, how to get better, creedoflife, creed-of-life" />
      <meta name="author" content="Max Surnin" />

      {/* Social Media Open Graph */}
      <meta property="og:title" content="Creed of Life: Embrace Your Personal Growth Journey" />
      <meta property="og:description" content="Creed of Life is a path to developing self-confidence, discipline, and adaptability. Transform your life by embracing growth with integrity and authenticity." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://creedoflife.com" />
      <meta property="og:image" content="/images/og-image.png" />

      {/* Twitter Card Meta */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Creed of Life: Embrace Your Personal Growth Journey" />
      <meta name="twitter:description" content="Creed of Life is a path to developing self-confidence, discipline, and adaptability. Transform your life by embracing growth with integrity and authenticity." />
      <meta name="twitter:image" content="/images/twitter-image.png" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />

      <body className="bg-gray-50 text-gray-800">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
