'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Library } from '@/lib/content/library-types';

type State = { status: 'idle' | 'loading' | 'error' } | { status: 'ready'; library: Library };

const cache = new Map<string, Promise<Library>>();

function load(locale: string): Promise<Library> {
  let request = cache.get(locale);
  if (!request) {
    request = fetch(`/api/library/${locale}`, { headers: { accept: 'application/json' } }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<Library>;
    });
    request.catch(() => cache.delete(locale));
    cache.set(locale, request);
  }
  return request;
}

/**
 * A page that already holds the library (the home explorer) shares it, so
 * search and Saved Reflections need no request at all.
 */
export function primeLibrary(library: Library) {
  if (!cache.has(library.locale)) cache.set(library.locale, Promise.resolve(library));
}

/** Fetches the library ahead of use. Failures are silent: `useLibrary` retries. */
export function preloadLibrary(locale: string) {
  load(locale).catch(() => {});
}

/**
 * Loads the localized library once per visit for the features that need it
 * (search, Saved Reflections). Pages never wait on it.
 */
export function useLibrary(locale: string, enabled: boolean) {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    load(locale).then(
      (library) => !cancelled && setState({ status: 'ready', library }),
      () => !cancelled && setState({ status: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [locale, enabled, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const status = state.status === 'idle' && enabled ? 'loading' : state.status;
  return { status, library: state.status === 'ready' ? state.library : null, retry };
}
