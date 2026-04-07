import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface ConversionArgs {
  farm_type: string;
  current_system?: string;
  jurisdiction?: string;
}

export function handleGetConversionProcess(db: Database, args: ConversionArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const rows = db.all<{
    id: number;
    farm_type: string;
    conversion_period_months: number;
    simultaneous_allowed: number;
    in_conversion_marketing: string;
    support_available: string;
    conditions: string;
  }>(
    'SELECT * FROM conversion_rules WHERE LOWER(farm_type) = LOWER(?) AND jurisdiction = ?',
    [args.farm_type, jv.jurisdiction]
  );

  if (rows.length === 0) {
    return {
      error: 'not_found',
      message: `No conversion rules found for farm type '${args.farm_type}'. ` +
        'Try: arable, permanent_grassland, permanent_crops, cattle, sheep_pigs, poultry.',
    };
  }

  return {
    farm_type: args.farm_type,
    jurisdiction: jv.jurisdiction,
    current_system: args.current_system ?? 'conventional',
    rules: rows.map(r => ({
      conversion_period_months: r.conversion_period_months,
      simultaneous_conversion_allowed: r.simultaneous_allowed === 1,
      in_conversion_marketing: r.in_conversion_marketing,
      support_available: r.support_available,
      conditions: r.conditions,
    })),
    _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk/eur/2018/848' }),
    _citation: buildCitation(
      `conversion:${args.farm_type}`,
      `Organic conversion: ${args.farm_type}`,
      'get_conversion_process',
      { farm_type: args.farm_type },
      'https://www.legislation.gov.uk/eur/2018/848',
    ),
  };
}
