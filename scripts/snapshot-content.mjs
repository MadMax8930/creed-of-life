#!/usr/bin/env node
/*
 * Exports the CreedOfLife content from MongoDB into content/creed-snapshot.json,
 * the static fallback the site serves when MongoDB cannot be reached.
 *
 * READ-ONLY: it runs one `aggregate` (the same pipeline the site uses, from
 * src/lib/content/pipeline.json) and never writes, updates or deletes anything
 * in the database. The connection string is never written to the snapshot.
 *
 * Usage:
 *   npm run snapshot                       export from MongoDB (DATABASE_URL in .env.local or the environment)
 *   npm run snapshot -- --from <url>       export from a running site's /api/data instead,
 *                                          e.g. --from https://creedoflife.com/api/data
 *   npm run snapshot -- --from <file>      use a saved copy of that /api/data response
 *   node scripts/snapshot-content.mjs --optional
 *                                          used by `prebuild`: refresh when possible, never fail the build
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'content/creed-snapshot.json');
const PIPELINE = resolve(root, 'src/lib/content/pipeline.json');
const LOCALES = ['en', 'es', 'fr', 'ru', 'th'];

const args = process.argv.slice(2);
const optional = args.includes('--optional');
const fromIndex = args.indexOf('--from');
const from = fromIndex >= 0 ? args[fromIndex + 1] : null;
const fromIsUrl = !!from && /^https?:\/\//i.test(from);

const log = (message) => console.log(`[snapshot] ${message}`);

function finish(message, code) {
  if (code === 0 || optional) {
    log(optional && code !== 0 ? `${message} Keeping the existing snapshot.` : message);
    process.exit(0);
  }
  console.error(`[snapshot] ${message}`);
  process.exit(code);
}

for (const file of ['.env.local', '.env']) {
  const path = resolve(root, file);
  if (existsSync(path) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(path);
    } catch {
      // Unreadable env file: fall back to the process environment.
    }
  }
}

async function exportFromMongo(databaseUrl) {
  const { MongoClient } = await import('mongodb');
  const pipeline = JSON.parse(readFileSync(PIPELINE, 'utf8'));
  const client = await MongoClient.connect(databaseUrl, { serverSelectionTimeoutMS: 10_000 });
  try {
    const dbName = new URL(databaseUrl).pathname.substring(1);
    return await client.db(dbName).collection('pillars').aggregate(pipeline).toArray();
  } finally {
    await client.close();
  }
}

/** The /api/data response, fetched live or read from a saved copy of it. */
async function exportFromApi(source) {
  let body;
  if (fromIsUrl) {
    const response = await fetch(source, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`${source} answered HTTP ${response.status}`);
    body = await response.json();
  } else {
    body = JSON.parse(readFileSync(resolve(process.cwd(), source), 'utf8'));
  }
  if (!Array.isArray(body?.pillars)) throw new Error(`${source} does not contain { pillars: [...] }`);
  return body.pillars;
}

function summarize(pillars) {
  const problems = [];
  const coverage = Object.fromEntries(LOCALES.map((l) => [l, 0]));
  let principles = 0;
  let passages = 0;
  const lines = [];

  for (const pillar of pillars) {
    if (typeof pillar?.name !== 'string' || !Array.isArray(pillar.branches)) {
      problems.push('a pillar has no name or no branches array');
      continue;
    }
    const branches = pillar.branches.filter((b) => typeof b?.name === 'string' && b.name);
    lines.push(`  ${pillar.name}`);
    for (const branch of branches) {
      principles++;
      const items = Array.isArray(branch.contentItems) ? branch.contentItems : [];
      lines.push(`    ${branch.name}: ${items.length} passage(s)`);
      for (const item of items) {
        passages++;
        for (const locale of LOCALES) {
          const t = item?.translations?.[locale];
          if (t?.title && t?.text) coverage[locale]++;
        }
      }
    }
  }
  if (pillars.length === 0) problems.push('no pillars');
  if (passages === 0) problems.push('no passages');
  return { problems, lines, coverage, counts: { pillars: pillars.length, principles, passages } };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!from && !databaseUrl) {
    return finish('DATABASE_URL is not set, so there is nothing to export from.', 1);
  }

  let raw;
  try {
    raw = from ? await exportFromApi(from) : await exportFromMongo(databaseUrl);
  } catch (error) {
    return finish(`Export failed: ${error?.name ?? 'Error'}: ${error?.message ?? error}.`, 1);
  }

  // ObjectIds and dates become plain strings; nothing else is changed.
  const pillars = JSON.parse(JSON.stringify(raw));
  const { problems, lines, coverage, counts } = summarize(pillars);
  if (problems.length > 0) {
    return finish(`The export looks wrong (${problems.join('; ')}). Nothing was written.`, 1);
  }

  let previous = null;
  try {
    previous = JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    // No readable previous snapshot.
  }
  if (previous && JSON.stringify(previous.pillars) === JSON.stringify(pillars)) {
    return finish(
      `Already up to date (${counts.pillars} pillars, ${counts.principles} principles, ${counts.passages} passages; exported ${previous.meta?.generatedAt}).`,
      0,
    );
  }

  const snapshot = {
    meta: {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      source: !from ? 'mongodb' : fromIsUrl ? 'api' : 'api-export-file',
      counts,
      translatedPassages: coverage,
      note: 'Generated by `npm run snapshot` from the MongoDB records (read-only export). Never edit this file by hand.',
    },
    pillars,
  };
  writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);

  log(`Wrote content/creed-snapshot.json from ${from ? (fromIsUrl ? from : 'a saved /api/data export') : 'MongoDB'}:`);
  for (const line of lines) console.log(line);
  log(`${counts.pillars} pillars, ${counts.principles} principles, ${counts.passages} passages.`);
  log(`Passages with a full translation: ${LOCALES.map((l) => `${l} ${coverage[l]}/${counts.passages}`).join(', ')}.`);
  if (counts.pillars !== 3 || counts.principles !== 9 || counts.passages !== 27) {
    log('Note: the expected shape is 3 pillars, 9 principles and 27 passages. Check the list above.');
  }
  return finish('Done. Review the diff and commit the file.', 0);
}

main();
