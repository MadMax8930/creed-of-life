'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { buildIndex, MIN_QUERY, search, type Segment } from '@/lib/content/search';
import { pillarVisual } from '@/lib/pillar-visuals';
import { useLibrary } from '@/lib/useLibrary';
import CreedIndex from './CreedIndex';

export interface SearchLabels {
  open: string;
  title: string;
  placeholder: string;
  close: string;
  hint: string;
  /** "No results for “{query}”." */
  noResults: string;
  /** "Results: {count}" */
  count: string;
  loading: string;
  error: string;
  retry: string;
  unavailable: string;
  indexTitle: string;
}

function Marked({ parts }: { parts: Segment[] }) {
  return (
    <>
      {parts.map((part, i) => (part.hit ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>))}
    </>
  );
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

/**
 * Search the creed: pillars, principles, passage headings and the words inside
 * the passages. The library is fetched the first time the dialog opens.
 */
export default function SearchDialog({ locale, labels }: { locale: string; labels: SearchLabels }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { status, library, retry } = useLibrary(locale, open);

  const index = useMemo(() => (library ? buildIndex(library) : null), [library]);
  const deferred = useDeferredValue(query);
  const hits = useMemo(() => (index ? search(index, deferred) : []), [index, deferred]);
  const searching = deferred.trim().length >= MIN_QUERY;

  function show() {
    if (dialog.current?.open) return;
    dialog.current?.showModal();
    setOpen(true);
    input.current?.focus();
  }
  function close() {
    dialog.current?.close();
  }

  // "/" or Ctrl/Cmd+K opens search from anywhere on the page.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const slash = event.key === '/' && !event.ctrlKey && !event.metaKey && !isTyping(event.target);
      const palette = event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey);
      if (!slash && !palette) return;
      event.preventDefault();
      if (dialog.current?.open) return;
      dialog.current?.showModal();
      setOpen(true);
      input.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /** Arrow keys walk from the field into the results and between them. */
  function onArrows(event: React.KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = Array.from(list.current?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
    if (links.length === 0) return;
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    event.preventDefault();
    if (event.key === 'ArrowDown') links[Math.min(at + 1, links.length - 1)]?.focus();
    else if (at <= 0) input.current?.focus();
    else links[at - 1]?.focus();
  }

  const status_ = !searching ? '' : labels.count.replace('{count}', String(hits.length));

  return (
    <>
      <button type="button" className="tool" aria-haspopup="dialog" aria-label={labels.open} onClick={show}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="7.5" cy="7.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M11.8 11.8L16.5 16.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span className="tool__text">{labels.open}</span>
      </button>

      <dialog
        ref={dialog}
        className="search"
        aria-labelledby="search-title"
        onClose={() => {
          setOpen(false);
          setQuery('');
        }}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        onKeyDown={onArrows}
      >
        <div className="search__bar">
          <h2 id="search-title" className="sr-only">
            {labels.title}
          </h2>
          <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
            <circle cx="7.5" cy="7.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11.8 11.8L16.5 16.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <input
            ref={input}
            type="search"
            className="search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.placeholder}
            aria-label={labels.placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          <button type="button" className="search__close" onClick={close}>
            {labels.close}
          </button>
        </div>

        <div className="search__body">
          <p className="sr-only" role="status" aria-live="polite">
            {status_}
          </p>

          {status === 'loading' && <p className="note">{labels.loading}</p>}
          {status === 'error' && (
            <div>
              <p>{labels.error}</p>
              <button type="button" className="button button--ghost" onClick={retry}>
                {labels.retry}
              </button>
            </div>
          )}
          {library && library.pillars.length === 0 && <p>{labels.unavailable}</p>}

          {library && library.pillars.length > 0 && !searching && (
            <>
              <p className="note">{labels.hint}</p>
              <CreedIndex library={library} title={labels.indexTitle} headingLevel={3} onNavigate={close} />
            </>
          )}

          {library && searching && hits.length === 0 && (
            <p>{labels.noResults.replace('{query}', deferred.trim())}</p>
          )}

          {library && searching && hits.length > 0 && (
            <ol ref={list} className="search__results">
              {hits.map((hit) => {
                const color = pillarVisual(hit.pillarSlug, hit.pillarIndex).color;
                const [path, fragment] = hit.href.split('#');
                // A link to another spot on the page already open must be a plain
                // anchor, so the browser fires `hashchange` and scrolls natively.
                const samePage = path === pathname && fragment;
                const content = (
                  <>
                    <span className="search__context">{hit.context}</span>
                    <span className="search__title">
                      <Marked parts={hit.title} />
                    </span>
                    {hit.snippet && (
                      <span className="search__snippet">
                        <Marked parts={hit.snippet} />
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={hit.key} style={{ '--pillar': color } as React.CSSProperties}>
                    {samePage ? (
                      <a href={`#${fragment}`} onClick={close}>
                        {content}
                      </a>
                    ) : (
                      <Link href={hit.href} onClick={close}>
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </dialog>
    </>
  );
}
