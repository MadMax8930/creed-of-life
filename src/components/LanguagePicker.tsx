'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type AppLocale } from '@/i18n/routing';
import { LANGUAGE_NAMES, localePath } from '@/lib/site';

/** Path without its locale prefix: "/fr/principles/mind" -> "/principles/mind". */
function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if (first && (locales as readonly string[]).includes(first)) return `/${rest.join('/')}`;
  return pathname || '/';
}

/** Same cookie next-intl reads, so "/" is not auto-redirected after a choice. */
function rememberLocale(code: AppLocale) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
}

interface LanguagePickerProps {
  locale: AppLocale;
  label: string;
  /** Localized language names for screen readers, keyed by locale. */
  spokenNames: Record<AppLocale, string>;
}

export default function LanguagePicker({ locale, label, spokenNames }: LanguagePickerProps) {
  const pathname = stripLocale(usePathname());
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="picker" ref={root}>
      <button
        ref={button}
        type="button"
        className="picker__button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${LANGUAGE_NAMES[locale]}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{locale.toUpperCase()}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open && (
        <ul className="picker__panel" id={panelId}>
          {locales.map((code) => (
            <li key={code}>
              <Link
                href={localePath(code, pathname)}
                prefetch={false}
                hrefLang={code}
                lang={code}
                aria-current={code === locale ? 'true' : undefined}
                aria-label={code === locale ? LANGUAGE_NAMES[code] : `${LANGUAGE_NAMES[code]} (${spokenNames[code]})`}
                onClick={() => {
                  rememberLocale(code);
                  setOpen(false);
                }}
              >
                <span>{LANGUAGE_NAMES[code]}</span>
                <span className="picker__code" aria-hidden="true">
                  {code.toUpperCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
