import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface CoverCropArgs {
  purpose?: string;
  season?: string;
  following_crop?: string;
  jurisdiction?: string;
}

export function handleGetCoverCropGuidance(db: Database, args: CoverCropArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM cover_crops WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.purpose) {
    sql += ' AND LOWER(purpose) LIKE LOWER(?)';
    params.push(`%${args.purpose}%`);
  }

  if (args.season) {
    sql += ' AND LOWER(sowing_window) LIKE LOWER(?)';
    params.push(`%${args.season}%`);
  }

  if (args.following_crop) {
    sql += ' AND LOWER(good_before) LIKE LOWER(?)';
    params.push(`%${args.following_crop}%`);
  }

  sql += ' ORDER BY species';

  const rows = db.all<{
    id: number;
    species: string;
    species_type: string;
    sowing_window: string;
    destruction_method: string;
    n_fixation_kg_ha: number;
    biomass_t_ha: number;
    good_before: string;
    purpose: string;
  }>(sql, params);

  return {
    jurisdiction: jv.jurisdiction,
    filters: {
      purpose: args.purpose ?? 'all',
      season: args.season ?? 'all',
      following_crop: args.following_crop ?? 'any',
    },
    results_count: rows.length,
    cover_crops: rows.map(r => ({
      species: r.species,
      species_type: r.species_type,
      sowing_window: r.sowing_window,
      destruction_method: r.destruction_method,
      n_fixation_kg_ha: r.n_fixation_kg_ha,
      biomass_t_ha: r.biomass_t_ha,
      good_before: r.good_before,
      purpose: r.purpose,
    })),
    _meta: buildMeta({ source_url: 'https://ahdb.org.uk/knowledge-library/cover-crops' }),
    _citation: buildCitation(
      `cover-crops:${args.purpose ?? args.season ?? 'all'}`,
      `Cover crop guidance${args.purpose ? `: ${args.purpose}` : ''}`,
      'get_cover_crop_guidance',
      { ...(args.purpose ? { purpose: args.purpose } : {}), ...(args.season ? { season: args.season } : {}) },
      'https://ahdb.org.uk/knowledge-library/cover-crops',
    ),
  };
}
