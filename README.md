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
```

### Environment variables

| Name | Used for | Required |
| --- | --- | --- |
| `DATABASE_URL` | MongoDB Atlas connection string (database name in the path). Read-only use. | Yes, at build time and at runtime (hourly revalidation). In Vercel, enable it for **Production and Preview**. |
| `NEXT_PUBLIC_BUYMEACOFFEE_USERNAME` | Buy Me a Coffee button in the footer. Hidden if unset. | No |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to `https://creedoflife.com`. | No |

`NEXT_PUBLIC_PAYPAL_MERCHANT_ID` is no longer used (the PayPal button was replaced by a contact link).

If `DATABASE_URL` is missing or MongoDB is unreachable during a build, the build
still succeeds and pages render without the reflections, exactly like before.
Pages revalidate every hour and fill in once MongoDB answers. At runtime, a
failed revalidation keeps serving the last good page.

### Content model

UI copy lives in `locales/*.json`. The philosophical content lives in MongoDB
and is read with the same aggregation pipeline as before (`src/lib/content/mongo.ts`):

- `pillars` { name, order, branches: [ids] }
- `branches` { name, order, pillar, contentItems: [ids] }
- `contents` { branch, translations: { en|es|fr|ru|th: { title, text } } }

Pillar and principle names are English keys translated through `pillarsJSON` and
`branchesJSON`. A reflection missing a translation falls back to English and is
labelled as such. Paragraphs are separated by blank lines in `text`.

### Routes

| URL | What |
| --- | --- |
| `/`, `/es`, `/fr`, `/ru`, `/th` | Home in each language (unchanged URLs) |
| `/[locale]/principles/[slug]` | One page per principle, e.g. `/fr/principles/self-awareness` (new) |
| `/sitemap.xml`, `/robots.txt` | Generated, with hreflang alternates |
| `/api/data?locale=xx` | Unchanged JSON endpoint |

### Project structure

```
src/
  app/[locale]/        layout, home, principle pages, 404
  app/api/data/        legacy JSON endpoint (same contract)
  app/sitemap.ts, robots.ts
  components/          header, footer, language picker, torn edge, ...
  i18n/                next-intl routing + request config
  lib/content/         MongoDB read + view model + localization helpers
  lib/                 site constants, SEO helpers, fonts, pillar visuals
  proxy.ts             locale routing (Next 16 "proxy", formerly middleware)
locales/               UI translations
public/                favicon, Open Graph images, original artwork
src/assets/            optimized images and font files used by the app
```
