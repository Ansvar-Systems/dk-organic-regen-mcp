#!/usr/bin/env tsx

/**
 * Update coverage.json from current database state.
 */

import { createDatabase } from '../src/db.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const db = createDatabase(join(DATA_DIR, 'database.db'));

const today = new Date().toISOString().split('T')[0];

const coverage = {
  mcp_name: 'UK Organic & Regenerative MCP',
  jurisdiction: 'GB',
  build_date: today,
  organic_standards: db.get<{ c: number }>('SELECT COUNT(*) as c FROM organic_standards')?.c ?? 0,
  permitted_inputs: db.get<{ c: number }>('SELECT COUNT(*) as c FROM permitted_inputs')?.c ?? 0,
  conversion_rules: db.get<{ c: number }>('SELECT COUNT(*) as c FROM conversion_rules')?.c ?? 0,
  cover_crops: db.get<{ c: number }>('SELECT COUNT(*) as c FROM cover_crops')?.c ?? 0,
  biodiversity_habitats: db.get<{ c: number }>('SELECT COUNT(*) as c FROM biodiversity_guidance')?.c ?? 0,
  soil_health_indicators: db.get<{ c: number }>('SELECT COUNT(*) as c FROM soil_health')?.c ?? 0,
  fts_entries: db.get<{ c: number }>('SELECT COUNT(*) as c FROM search_index')?.c ?? 0,
  source_hash: 'manual',
};

writeFileSync(join(DATA_DIR, 'coverage.json'), JSON.stringify(coverage, null, 2) + '\n');
console.log('Coverage updated:', coverage);

db.close();
