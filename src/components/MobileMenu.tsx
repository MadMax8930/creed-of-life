'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface MobileMenuProps {
  labels: { menu: string; close: string; primary: string };
  links: Array<{ href: string; label: string }>;
}

/** Full-screen menu below 52rem. Desktop uses the inline nav instead. */
export default function MobileMenu({ labels, links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const sheetId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstLink.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia('(min-width: 52rem)').matches) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        className="menu-button"
        aria-expanded={open}
        aria-controls={sheetId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? labels.close : labels.menu}
      </button>
      {open && (
        <nav className="menu-sheet" id={sheetId} aria-label={labels.primary}>
          <ul className="wrap">
            {links.map((link, i) => (
              <li key={link.href}>
                <a href={link.href} ref={i === 0 ? firstLink : undefined} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
