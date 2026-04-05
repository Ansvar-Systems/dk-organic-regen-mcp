import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleSearchOrganicGuidance } from '../../src/tools/search-organic-guidance.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-search-organic.db';

describe('search_organic_guidance tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns results for copper query', () => {
    const result = handleSearchOrganicGuidance(db, { query: 'copper' });
    expect(result).toHaveProperty('results_count');
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('returns results for organic conversion query', () => {
    const result = handleSearchOrganicGuidance(db, { query: 'conversion' });
    expect(result).toHaveProperty('results_count');
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('respects topic filter', () => {
    const result = handleSearchOrganicGuidance(db, { query: 'organic', topic: 'organic_standards' });
    const typed = result as { results: { topic: string }[] };
    for (const r of typed.results) {
      expect(r.topic).toBe('organic_standards');
    }
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleSearchOrganicGuidance(db, { query: 'organic', jurisdiction: 'FR' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });
});
