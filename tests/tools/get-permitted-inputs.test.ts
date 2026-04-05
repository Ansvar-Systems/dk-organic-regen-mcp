import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetPermittedInputs } from '../../src/tools/get-permitted-inputs.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-permitted-inputs.db';

describe('get_permitted_inputs tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns fertiliser inputs', () => {
    const result = handleGetPermittedInputs(db, { input_type: 'fertiliser' });
    expect(result).toHaveProperty('results_count');
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('returns plant protection inputs', () => {
    const result = handleGetPermittedInputs(db, { input_type: 'plant_protection' });
    expect(result).toHaveProperty('results_count');
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('copper limit is 6 kg Cu/ha/year', () => {
    const result = handleGetPermittedInputs(db, { input_type: 'plant_protection' });
    const inputs = (result as { inputs: { substance: string; max_rate: string }[] }).inputs;
    const copper = inputs.find(i => i.substance.toLowerCase().includes('copper'));
    expect(copper).toBeDefined();
    expect(copper!.max_rate).toBe('6 kg Cu/ha/year');
  });

  test('returns not_found for unknown type', () => {
    const result = handleGetPermittedInputs(db, { input_type: 'herbicide' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetPermittedInputs(db, { input_type: 'fertiliser', jurisdiction: 'IT' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });
});
