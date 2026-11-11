'use client';

import { useSyncExternalStore } from 'react';

/*
 * Saved Reflections live only in this browser (localStorage). Only passage
 * identifiers are stored, never the text, and nothing is sent to a server.
 */
const KEY = 'creedoflife.saved.v1';
const EVENT = 'creedoflife:saved';
const LIMIT = 200;
const EMPTY: readonly string[] = Object.freeze([]);

/** Used for the rest of the visit when the browser refuses storage. */
let memory: string | null = null;
let cachedRaw: string | null | undefined;
let cachedIds: readonly string[] = EMPTY;

function readRaw(): string | null {
  if (memory !== null) return memory;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): readonly string[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedIds;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedIds = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : EMPTY;
  } catch {
    cachedIds = EMPTY;
  }
  return cachedIds;
}

function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function write(ids: string[]) {
  const raw = JSON.stringify(ids.slice(0, LIMIT));
  try {
    window.localStorage.setItem(KEY, raw);
    memory = null;
  } catch {
    memory = raw;
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function toggleSaved(id: string) {
  const ids = [...getSnapshot()];
  const at = ids.indexOf(id);
  if (at >= 0) ids.splice(at, 1);
  else ids.unshift(id);
  write(ids);
}

export function removeSaved(remove: string[]) {
  const drop = new Set(remove);
  write(getSnapshot().filter((id) => !drop.has(id)));
}

/** Saved passage ids, newest first. Empty during server rendering. */
export function useSavedIds(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
