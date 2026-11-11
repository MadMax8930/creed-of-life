## Creed of Life

A practical philosophy in three pillars and nine principles, in five languages
(en, es, fr, ru, th). Live at https://creedoflife.com.

### Stack

- **Next.js 16** (App Router, Server Components, Turbopack), **React 19**
- **next-intl 4** for translations (server-side only, no i18n runtime in the browser)
- **MongoDB Atlas** (official `mongodb` driver) for the principles' reflections
- **Tailwind CSS 4** plus semantic component classes in `src/app/globals.css`
- Self-hosted fonts via `next/font/local`: Unbounded, Literata, Kanit, Noto Serif Thai (SIL OFL)
- Node **22.x** (Next 16 requires Node 20.9 or newer)

### Getting started

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
npm run check                # TypeScript + ESLint
npm run snapshot             # refresh the static content fallback (read-only)
```

### Environment variables

| Name | Used for | Required |
| --- | --- | --- |
| `DATABASE_URL` | MongoDB Atlas connection string (database name in the path). Read-only use. | Yes for live content, at build time and at runtime (hourly revalidation). In Vercel, enable it for **Production and Preview**. Without it the static snapshot is served. |
| `NEXT_PUBLIC_BUYMEACOFFEE_USERNAME` | Buy Me a Coffee button in the footer. Hidden if unset. | No |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to `https://creedoflife.com`. | No |

`NEXT_PUBLIC_PAYPAL_MERCHANT_ID` is no longer used (the PayPal button was replaced by a contact link to `enjoyoway@gmail.com`).

If `DATABASE_URL` is missing or MongoDB is unreachable, builds still succeed and
pages are served from the static snapshot (see below). Pages revalidate every
hour, so they return to live MongoDB content as soon as it answers again.

### Content: MongoDB first, static snapshot as fallback

UI copy lives in `locales/*.json`. The philosophical content (3 pillars, 9
principles, 27 passages, each in 5 languages) lives in MongoDB, which stays the
single source of truth. The app only ever **reads** it, with the same
aggregation pipeline as the original site (`src/lib/content/pipeline.json`):

- `pillars` { name, order, branches: [ids] }
- `branches` { name, order, pillar, contentItems: [ids] }
- `contents` { branch, translations: { en|es|fr|ru|th: { title, text } } }

Every render picks its source in this order (`src/lib/content/index.ts`):

1. **MongoDB.** If it answers with content, that content is used. Always.
2. **Static snapshot** (`content/creed-snapshot.json`) when `DATABASE_URL` is
   missing, the connection or query fails, or MongoDB returns nothing. The server
   logs `[creed] FALLBACK ACTIVE: <reason>`.
3. **Neither:** pages render an informative "cannot be shown right now" state.
   Nothing is ever invented.

The snapshot is the `/api/data` response (`{ pillars: [...] }`, ids as strings)
plus a `meta` block (export time, counts, translation coverage). It contains no
credentials. Visitors get the same experience from either source; the home page
exposes which one served it as `data-content-source` on the explorer element,
and `/api/data` as the `X-Content-Source` header.

#### Regenerating the snapshot after editing content in MongoDB

```bash
npm run snapshot                                             # from MongoDB (DATABASE_URL in .env.local)
npm run snapshot -- --from https://creedoflife.com/api/data  # or from the live endpoint
npm run snapshot -- --from ./data.json                       # or from a saved copy of that response
```

The script is read-only (one `aggregate`), validates the result (pillars,
principles, passages, translations per language), refuses to write an empty or
malformed export, and leaves the file untouched when nothing changed. Review the
diff and commit `content/creed-snapshot.json`. Never edit that file by hand.

`npm run build` runs the same export first (`prebuild`, optional mode): when
MongoDB is reachable the deployed fallback matches the database at build time;
when it is not, the committed snapshot is kept and the build still succeeds.

Pillar and principle names are English keys translated through `pillarsJSON` and
`branchesJSON`. A passage without a translation falls back to English, field by
field, and is labelled as such. Paragraphs are separated by blank lines in `text`.

### Reading experience

- **Explorer** (home, `CreedExplorer`): choose a pillar, then one of its
  principles, and read its passages in place. The selection is mirrored in the
  URL hash (`/#resilience`), so it can be linked and restored.
- **Principle pages** (`/[locale]/principles/[slug]`): the same switcher and
  reading layout as real links, one indexable page per principle.
- **Daily Reset**: one existing passage per UTC day, chosen deterministically
  (`src/lib/content/daily.ts`), the same for every visitor.
- **Saved Reflections** (`/[locale]/saved`): bookmarks kept in the browser
  (`localStorage`, passage ids only). No account, nothing sent to a server.
- **Search**: pillars, principles, headings and passage text, in the browser,
  over whichever source served the content (`/api/library/[locale]`).

### Routes

| URL | What |
| --- | --- |
| `/`, `/es`, `/fr`, `/ru`, `/th` | Home in each language (unchanged URLs) |
| `/[locale]/principles/[slug]` | One page per principle, e.g. `/fr/principles/self-awareness` |
| `/[locale]/saved` | Saved Reflections (not indexed) |
| `/sitemap.xml`, `/robots.txt` | Generated, with hreflang alternates |
| `/api/data?locale=xx` | Original JSON endpoint, same contract; serves the snapshot if MongoDB fails |
| `/api/library/[locale]` | Localized, display-ready content for search and Saved Reflections |

### Project structure

```
content/creed-snapshot.json   static fallback, exported from MongoDB (never hand-edited)
scripts/snapshot-content.mjs  read-only export that writes the snapshot
src/
  app/[locale]/        layout, home, principle pages, saved, 404
  app/api/data/        original JSON endpoint (same contract)
  app/api/library/     localized content for search and Saved Reflections
  app/sitemap.ts, robots.ts
  components/          explorer, passage, daily reset, search, saved, header, footer...
  i18n/                next-intl routing + request config
  lib/content/         MongoDB read, snapshot, source order, library view, search, daily pick
  lib/                 site constants, SEO helpers, fonts, pillar visuals, saved store
  proxy.ts             locale routing (Next 16 "proxy", formerly middleware)
locales/               UI translations
public/                favicon, Open Graph images, original artwork
src/assets/            optimized images and font files used by the app
```
