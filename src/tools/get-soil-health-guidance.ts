import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface SoilHealthArgs {
  indicator?: string;
  soil_type?: string;
  jurisdiction?: string;
}

export function handleGetSoilHealthGuidance(db: Database, args: SoilHealthArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM soil_health WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.indicator) {
    sql += ' AND LOWER(indicator) LIKE LOWER(?)';
    params.push(`%${args.indicator}%`);
  }

  if (args.soil_type) {
    sql += ' AND (LOWER(soil_type) LIKE LOWER(?) OR soil_type IS NULL)';
    params.push(`%${args.soil_type}%`);
  }

  sql += ' ORDER BY indicator';

  const rows = db.all<{
    id: number;
    indicator: string;
    target_range: string;
    measurement_method: string;
    management_practices: string;
    improvement_timeline: string;
    soil_type: string;
  }>(sql, params);

  return {
    jurisdiction: jv.jurisdiction,
    filters: {
      indicator: args.indicator ?? 'all',
      soil_type: args.soil_type ?? 'all',
    },
    results_count: rows.length,
    indicators: rows.map(r => ({
      indicator: r.indicator,
      target_range: r.target_range,
      measurement_method: r.measurement_method,
      management_practices: r.management_practices,
      improvement_timeline: r.improvement_timeline,
      soil_type: r.soil_type,
    })),
    _meta: buildMeta({ source_url: 'https://ahdb.org.uk/knowledge-library/soil-health' }),
  };
}
