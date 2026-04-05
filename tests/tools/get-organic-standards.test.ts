import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetOrganicStandards } from '../../src/tools/get-organic-standards.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-organic-standards.db';

describe('get_organic_standards tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns standards for arable', () => {
    const result = handleGetOrganicStandards(db, { product_type: 'arable' });
    expect(result).toHaveProperty('results_count');
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('filters by certification body', () => {
    const result = handleGetOrganicStandards(db, { product_type: 'arable', standard: 'Soil Association' });
    expect(result).toHaveProperty('standards_by_body');
    const typed = result as { standards_by_body: { certification_body: string }[] };
    expect(typed.standards_by_body.length).toBeGreaterThan(0);
    expect(typed.standards_by_body[0].certification_body).toBe('Soil Association');
  });

  test('counts additional-to-EU requirements', () => {
    const result = handleGetOrganicStandards(db, { product_type: 'arable' });
    expect(result).toHaveProperty('eu_additional_count');
    expect((result as { eu_additional_count: number }).eu_additional_count).toBeGreaterThan(0);
  });

  test('returns not_found for unknown product type', () => {
    const result = handleGetOrganicStandards(db, { product_type: 'aquaculture' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetOrganicStandards(db, { product_type: 'arable', jurisdiction = 'DK' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });
});
