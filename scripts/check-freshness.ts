#!/usr/bin/env tsx

/**
 * Check data freshness and report staleness status.
 */

import { createDatabase } from '../src/db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = createDatabase(join(__dirname, '..', 'data', 'database.db'));

const STALENESS_THRESHOLD_DAYS = 90;

const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

if (!lastIngest?.value) {
  console.log('STATUS: unknown — no ingest date recorded');
  process.exit(0);
}

const ingestDate = new Date(lastIngest.value);
const now = new Date();
const daysSince = Math.floor((now.getTime() - ingestDate.getTime()) / (1000 * 60 * 60 * 24));

if (daysSince > STALENESS_THRESHOLD_DAYS) {
  console.log(`STATUS: stale — last ingest ${daysSince} days ago (${lastIngest.value})`);
  console.log(`Threshold: ${STALENESS_THRESHOLD_DAYS} days`);
  console.log('Run: gh workflow run ingest.yml -R Ansvar-Systems/uk-organic-regen-mcp');
  process.exit(1);
} else {
  console.log(`STATUS: fresh — last ingest ${daysSince} days ago (${lastIngest.value})`);
}

db.close();
