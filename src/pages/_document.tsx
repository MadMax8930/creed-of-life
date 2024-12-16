import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      {/* Meta tags for SEO */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Take this fun quiz to see if you're wifey material! Answer questions, learn the correct choices, and share your score!" />
      <meta name="keywords" content="quiz, wifey material, fun quiz, relationship quiz, personality test" />
      <meta name="author" content="Max Surnin" />

      {/* Social Media Open Graph */}
      <meta property="og:title" content="Are You Wifey Material? | Fun Personality Quiz" />
      <meta property="og:description" content="A fun quiz to see how much you're 'wifey material'! Answer questions and get your score!" />
      <meta property="og:image" content="/images/og-image.png" />
      <meta property="og:url" content="https://wifeymaterialscore.com" />
      <meta property="og:type" content="website" />

      {/* Twitter Card Meta */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Are You Wifey Material? | Fun Personality Quiz" />
      <meta name="twitter:description" content="Find out if you're wifey material with this fun personality quiz!" />
      <meta name="twitter:image" content="/images/twitter-image.png" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />

      {/* Fonts */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" />
      <body className="bg-gray-50 text-gray-800">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
