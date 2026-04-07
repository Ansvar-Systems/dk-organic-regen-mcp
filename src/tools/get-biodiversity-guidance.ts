import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface BiodiversityArgs {
  habitat_type?: string;
  farm_feature?: string;
  jurisdiction?: string;
}

export function handleGetBiodiversityGuidance(db: Database, args: BiodiversityArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM biodiversity_guidance WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.habitat_type) {
    sql += ' AND LOWER(habitat_type) LIKE LOWER(?)';
    params.push(`%${args.habitat_type}%`);
  }

  if (args.farm_feature) {
    sql += ' AND LOWER(farm_feature) LIKE LOWER(?)';
    params.push(`%${args.farm_feature}%`);
  }

  sql += ' ORDER BY habitat_type';

  const rows = db.all<{
    id: number;
    habitat_type: string;
    farm_feature: string;
    bng_units_per_ha: number;
    creation_cost_per_ha: number;
    management_obligation_years: number;
    grant_available: string;
  }>(sql, params);

  return {
    jurisdiction: jv.jurisdiction,
    filters: {
      habitat_type: args.habitat_type ?? 'all',
      farm_feature: args.farm_feature ?? 'all',
    },
    results_count: rows.length,
    habitats: rows.map(r => ({
      habitat_type: r.habitat_type,
      farm_feature: r.farm_feature,
      bng_units_per_ha: r.bng_units_per_ha,
      creation_cost_per_ha: r.creation_cost_per_ha,
      management_obligation_years: r.management_obligation_years,
      grant_available: r.grant_available,
    })),
    _meta: buildMeta({ source_url: 'https://www.gov.uk/government/collections/biodiversity-net-gain' }),
    _citation: buildCitation(
      `biodiversity:${args.habitat_type ?? args.farm_feature ?? 'all'}`,
      `Biodiversity guidance${args.habitat_type ? `: ${args.habitat_type}` : ''}`,
      'get_biodiversity_guidance',
      { ...(args.habitat_type ? { habitat_type: args.habitat_type } : {}), ...(args.farm_feature ? { farm_feature: args.farm_feature } : {}) },
      'https://www.gov.uk/government/collections/biodiversity-net-gain',
    ),
  };
}
