'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import PrincipleEmblem from './PrincipleEmblem';

interface Item {
  slug: string;
  href: string;
  number: number;
  name: string;
}

/** Where the switcher sat in the viewport when a card was clicked. */
let held: { top: number; at: number } | null = null;

/**
 * The principle switcher of a principle page: real links to the sibling
 * principles. Moving between them keeps the reader where they are instead of
 * jumping back to the top, and keeps the switcher at the same place on screen
 * even when the new title above it takes more or fewer lines.
 */
export default function PrincipleSwitcher({ label, current, items }: { label: string; current: string; items: Item[] }) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const from = held;
    held = null;
    const nav = ref.current;
    // Only right after a click on a card: back/forward and other links are left
    // to the browser and the router.
    if (!from || !nav || performance.now() - from.at > 4000) return;
    const shift = nav.getBoundingClientRect().top - from.top;
    if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: 'instant' });
    // The page is a new one, so focus would be lost: keep it on the chosen card.
    nav.querySelector<HTMLElement>('[aria-current="page"]')?.focus({ preventScroll: true });
  }, [current]);

  return (
    <nav ref={ref} className="pcards pcards--page" aria-label={label}>
      {items.map((item) => (
        <Link
          key={item.slug}
          className="pcard"
          href={item.href}
          scroll={false}
          aria-current={item.slug === current ? 'page' : undefined}
          onClick={(event) => {
            // New tab or window, or the card already shown: nothing to hold.
            if (item.slug === current || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (ref.current) held = { top: ref.current.getBoundingClientRect().top, at: performance.now() };
          }}
        >
          <PrincipleEmblem slug={item.slug} className="pcard__emblem" />
          <span className="pcard__text">
            <span className="pcard__n" aria-hidden="true">
              {item.number}
            </span>
            <span className="pcard__name">{item.name}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
