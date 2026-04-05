import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetSoilHealthGuidance } from '../../src/tools/get-soil-health-guidance.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-soil-health.db';

describe('get_soil_health_guidance tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns all indicators when no filter', () => {
    const result = handleGetSoilHealthGuidance(db, {});
    expect(result).toHaveProperty('results_count');
    expect(result.results_count).toBe(4);
  });

  test('filters by indicator name', () => {
    const result = handleGetSoilHealthGuidance(db, { indicator: 'pH' });
    expect(result.results_count).toBe(1);
    expect(result.indicators[0].indicator).toBe('pH');
  });

  test('returns target ranges', () => {
    const result = handleGetSoilHealthGuidance(db, { indicator: 'Organic matter' });
    expect(result.indicators[0].target_range).toContain('3-6%');
  });

  test('returns improvement timelines', () => {
    const result = handleGetSoilHealthGuidance(db, { indicator: 'Earthworm' });
    expect(result.indicators[0].improvement_timeline).toContain('3-5');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetSoilHealthGuidance(db, { jurisdiction: 'US' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('includes _meta', () => {
    const result = handleGetSoilHealthGuidance(db, {});
    expect(result._meta).toHaveProperty('disclaimer');
  });
});
