'use client';

import { useEffect, useState } from 'react';

/**
 * A small floating button that returns to the top. It appears once the reader is
 * more than one screen down, and hides again over the footer's closing strip.
 */
export default function BackToTop({ label }: { label: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The last strip of the footer (languages, copyright) reaches into the
      // corner: step aside there instead of covering its links.
      const strip = document.querySelector('.footer__base');
      const clear = !strip || strip.getBoundingClientRect().top >= window.innerHeight - 16;
      setShown(window.scrollY > window.innerHeight && clear);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      className="to-top"
      data-shown={shown || undefined}
      aria-label={label}
      title={label}
      onClick={() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
      }}
    >
      <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
        <path d="M8 16.5V2M2 7.5l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
