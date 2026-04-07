import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface OrganicStandardsArgs {
  product_type: string;
  standard?: string;
  jurisdiction?: string;
}

export function handleGetOrganicStandards(db: Database, args: OrganicStandardsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = `SELECT * FROM organic_standards WHERE LOWER(product_type) = LOWER(?) AND jurisdiction = ?`;
  const params: unknown[] = [args.product_type, jv.jurisdiction];

  if (args.standard) {
    sql += ' AND LOWER(certification_body) LIKE LOWER(?)';
    params.push(`%${args.standard}%`);
  }

  sql += ' ORDER BY certification_body, category';

  const rows = db.all<{
    id: number;
    certification_body: string;
    product_type: string;
    requirement: string;
    category: string;
    eu_regulation_ref: string;
    additional_to_eu: number;
  }>(sql, params);

  if (rows.length === 0) {
    return {
      error: 'not_found',
      message: `No organic standards found for product type '${args.product_type}'.` +
        (args.standard ? ` Try without the standard filter, or check product types: arable, dairy, beef_sheep, poultry, horticulture, processing.` : ''),
    };
  }

  const grouped: Record<string, Record<string, string[]>> = {};
  for (const row of rows) {
    if (!grouped[row.certification_body]) grouped[row.certification_body] = {};
    const cat = row.category || 'general';
    if (!grouped[row.certification_body][cat]) grouped[row.certification_body][cat] = [];
    grouped[row.certification_body][cat].push(row.requirement);
  }

  return {
    product_type: args.product_type,
    jurisdiction: jv.jurisdiction,
    results_count: rows.length,
    standards_by_body: Object.entries(grouped).map(([body, categories]) => ({
      certification_body: body,
      categories: Object.entries(categories).map(([cat, reqs]) => ({
        category: cat,
        requirements: reqs,
      })),
    })),
    eu_additional_count: rows.filter(r => r.additional_to_eu === 1).length,
    _meta: buildMeta({ source_url: 'https://www.soilassociation.org/our-standards/' }),
    _citation: buildCitation(
      `organic:${args.product_type}`,
      `Organic standards: ${args.product_type}`,
      'get_organic_standards',
      { product_type: args.product_type, ...(args.standard ? { standard: args.standard } : {}) },
      'https://www.soilassociation.org/our-standards/',
    ),
  };
}
