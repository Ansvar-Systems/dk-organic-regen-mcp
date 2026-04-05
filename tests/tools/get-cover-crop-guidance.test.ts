import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetCoverCropGuidance } from '../../src/tools/get-cover-crop-guidance.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-cover-crops.db';

describe('get_cover_crop_guidance tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns all cover crops when no filter', () => {
    const result = handleGetCoverCropGuidance(db, {});
    expect(result).toHaveProperty('results_count');
    expect(result.results_count).toBe(4);
  });

  test('filters by purpose', () => {
    const result = handleGetCoverCropGuidance(db, { purpose: 'nitrogen_fixation' });
    expect(result.results_count).toBeGreaterThan(0);
    for (const crop of result.cover_crops) {
      expect(crop.purpose.toLowerCase()).toContain('nitrogen_fixation');
    }
  });

  test('returns N fixation data for legumes', () => {
    const result = handleGetCoverCropGuidance(db, { purpose: 'nitrogen_fixation' });
    for (const crop of result.cover_crops) {
      expect(crop.n_fixation_kg_ha).toBeGreaterThan(0);
    }
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetCoverCropGuidance(db, { jurisdiction: 'NL' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('includes _meta with source URL', () => {
    const result = handleGetCoverCropGuidance(db, {});
    expect(result._meta).toHaveProperty('disclaimer');
    expect(result._meta.source_url).toContain('ahdb');
  });
});
