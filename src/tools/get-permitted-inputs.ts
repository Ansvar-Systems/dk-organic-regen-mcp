import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface PermittedInputsArgs {
  input_type: string;
  crop_or_species?: string;
  jurisdiction?: string;
}

export function handleGetPermittedInputs(db: Database, args: PermittedInputsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const rows = db.all<{
    id: number;
    input_type: string;
    substance: string;
    annex: string;
    conditions: string;
    max_rate: string;
    derogation_available: number;
  }>(
    'SELECT * FROM permitted_inputs WHERE LOWER(input_type) = LOWER(?) AND jurisdiction = ? ORDER BY substance',
    [args.input_type, jv.jurisdiction]
  );

  if (rows.length === 0) {
    return {
      error: 'not_found',
      message: `No permitted inputs found for type '${args.input_type}'. ` +
        'Try: fertiliser, plant_protection, feed_additive.',
    };
  }

  return {
    input_type: args.input_type,
    jurisdiction: jv.jurisdiction,
    results_count: rows.length,
    inputs: rows.map(r => ({
      substance: r.substance,
      annex: r.annex,
      conditions: r.conditions,
      max_rate: r.max_rate,
      derogation_available: r.derogation_available === 1,
    })),
    _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk/eur/2018/848' }),
  };
}
