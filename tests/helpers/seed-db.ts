import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Organic standards
  db.run(
    `INSERT INTO organic_standards (certification_body, product_type, requirement, category, eu_regulation_ref, additional_to_eu, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Soil Association', 'arable', 'Max 170 kg N/ha from all sources', 'nitrogen', 'Reg 2018/848 Annex II', 0, 'GB']
  );
  db.run(
    `INSERT INTO organic_standards (certification_body, product_type, requirement, category, eu_regulation_ref, additional_to_eu, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Soil Association', 'arable', 'Crop rotation required including nitrogen-fixing crops', 'rotation', 'Reg 2018/848 Art 12', 0, 'GB']
  );
  db.run(
    `INSERT INTO organic_standards (certification_body, product_type, requirement, category, eu_regulation_ref, additional_to_eu, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Soil Association', 'arable', '15% of farmed area as ecological focus area', 'biodiversity', 'SA additional', 1, 'GB']
  );
  db.run(
    `INSERT INTO organic_standards (certification_body, product_type, requirement, category, eu_regulation_ref, additional_to_eu, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Soil Association', 'dairy', 'Outdoor access mandatory, min 200 days/year', 'welfare', 'SA additional', 1, 'GB']
  );
  db.run(
    `INSERT INTO organic_standards (certification_body, product_type, requirement, category, eu_regulation_ref, additional_to_eu, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['EU Baseline', 'arable', 'No GMOs, no synthetic pesticides, no manufactured nitrogen fertiliser', 'general', 'Reg 2018/848 Art 5', 0, 'GB']
  );

  // Permitted inputs
  db.run(
    `INSERT INTO permitted_inputs (input_type, substance, annex, conditions, max_rate, derogation_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['fertiliser', 'Composted farmyard manure', 'Annex I', 'Must be composted; from organic or conventional non-industrial sources', '170 kg N/ha', 0, 'GB']
  );
  db.run(
    `INSERT INTO permitted_inputs (input_type, substance, annex, conditions, max_rate, derogation_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['fertiliser', 'Rock phosphate', 'Annex I', 'Naturally derived only; cadmium below threshold', 'No limit', 0, 'GB']
  );
  db.run(
    `INSERT INTO permitted_inputs (input_type, substance, annex, conditions, max_rate, derogation_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['plant_protection', 'Copper compounds', 'Annex II', 'Fungicide use only; reduced from 8 kg in 2019', '6 kg Cu/ha/year', 0, 'GB']
  );
  db.run(
    `INSERT INTO permitted_inputs (input_type, substance, annex, conditions, max_rate, derogation_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['plant_protection', 'Sulphur', 'Annex II', 'Fungicide and acaricide', 'No limit', 0, 'GB']
  );
  db.run(
    `INSERT INTO permitted_inputs (input_type, substance, annex, conditions, max_rate, derogation_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['feed_additive', 'Vitamins A, D, E (synthetic)', 'Annex III', 'Permitted for livestock when dietary needs cannot be met from feed', 'As required', 0, 'GB']
  );

  // Conversion rules
  db.run(
    `INSERT INTO conversion_rules (farm_type, conversion_period_months, simultaneous_allowed, in_conversion_marketing, support_available, conditions, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['arable', 24, 0, 'In-conversion produce can be sold as "in-conversion" at lower price', 'CS organic management payments available in England', 'Must be 24 months before sowing of first organic crop', 'GB']
  );
  db.run(
    `INSERT INTO conversion_rules (farm_type, conversion_period_months, simultaneous_allowed, in_conversion_marketing, support_available, conditions, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['permanent_crops', 36, 0, 'In-conversion produce can be sold as "in-conversion"', 'CS organic management payments available', '36 months before first organic harvest (orchards, vines)', 'GB']
  );
  db.run(
    `INSERT INTO conversion_rules (farm_type, conversion_period_months, simultaneous_allowed, in_conversion_marketing, support_available, conditions, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 12, 1, 'Animals cannot be sold as organic during conversion', 'CS organic management payments available', '12 months or 3/4 of animals life, whichever is shorter; simultaneous conversion with land possible', 'GB']
  );

  // Cover crops
  db.run(
    `INSERT INTO cover_crops (species, species_type, sowing_window, destruction_method, n_fixation_kg_ha, biomass_t_ha, good_before, purpose, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Crimson clover', 'legume', 'Jul-Aug', 'Mow and incorporate', 100, 4, 'Spring cereals', 'nitrogen_fixation, pollinator', 'GB']
  );
  db.run(
    `INSERT INTO cover_crops (species, species_type, sowing_window, destruction_method, n_fixation_kg_ha, biomass_t_ha, good_before, purpose, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Phacelia', 'non-legume', 'Apr-Sep', 'Frost-killed', 0, 3, 'Any crop', 'pollinator, biomass', 'GB']
  );
  db.run(
    `INSERT INTO cover_crops (species, species_type, sowing_window, destruction_method, n_fixation_kg_ha, biomass_t_ha, good_before, purpose, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Mustard', 'brassica', 'Aug-Sep', 'Frost-killed or incorporate', 0, 3, 'Avoid before OSR (clubroot risk)', 'biofumigation, biomass', 'GB']
  );
  db.run(
    `INSERT INTO cover_crops (species, species_type, sowing_window, destruction_method, n_fixation_kg_ha, biomass_t_ha, good_before, purpose, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Winter vetch', 'legume', 'Aug-Oct', 'Incorporate in spring', 90, 4.5, 'Spring crops', 'nitrogen_fixation, biomass', 'GB']
  );

  // Biodiversity guidance
  db.run(
    `INSERT INTO biodiversity_guidance (habitat_type, farm_feature, bng_units_per_ha, creation_cost_per_ha, management_obligation_years, grant_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Wildflower meadow', 'field_margin', 4.0, 4000, 30, 'CS higher-tier payment available', 'GB']
  );
  db.run(
    `INSERT INTO biodiversity_guidance (habitat_type, farm_feature, bng_units_per_ha, creation_cost_per_ha, management_obligation_years, grant_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Hedgerow planting', 'boundary', 2.0, 1250, 30, 'CS hedgerow creation payment', 'GB']
  );
  db.run(
    `INSERT INTO biodiversity_guidance (habitat_type, farm_feature, bng_units_per_ha, creation_cost_per_ha, management_obligation_years, grant_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Farm pond', 'in_field', 2.5, 5500, 30, 'CS pond creation payment', 'GB']
  );

  // Soil health indicators
  db.run(
    `INSERT INTO soil_health (indicator, target_range, measurement_method, management_practices, improvement_timeline, soil_type, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Organic matter', '3-6% (arable), 6-10% (grassland)', 'Loss on ignition (LOI) or VESS test', 'Cover crops, FYM application, reduced tillage, crop residue incorporation', '5-10 years for measurable change', 'all', 'GB']
  );
  db.run(
    `INSERT INTO soil_health (indicator, target_range, measurement_method, management_practices, improvement_timeline, soil_type, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Earthworm count', '>16 per spade-depth (30x30cm)', 'OPAL earthworm survey method', 'No-till or min-till, organic matter additions, avoid soil compaction', '3-5 years', 'all', 'GB']
  );
  db.run(
    `INSERT INTO soil_health (indicator, target_range, measurement_method, management_practices, improvement_timeline, soil_type, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['pH', '6.0-6.5 (arable), 5.8-6.0 (grassland)', 'Standard soil lab test', 'Lime application to correct acidity', '6-12 months', 'all', 'GB']
  );
  db.run(
    `INSERT INTO soil_health (indicator, target_range, measurement_method, management_practices, improvement_timeline, soil_type, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Bulk density', '<1.4 g/cm3 (clay), <1.6 g/cm3 (sand)', 'Core sample method', 'Subsoiling, bio-drilling cover crops, controlled traffic farming', '1-3 years', 'all', 'GB']
  );

  // FTS5 search index
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Organic Arable Standards', 'Organic arable farming requires crop rotation with nitrogen-fixing crops, max 170 kg N/ha, and 15% ecological focus area (Soil Association). No GMOs, no synthetic pesticides, no manufactured nitrogen fertiliser.', 'organic_standards', 'GB']
  );
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Copper Limits in Organic Farming', 'Copper compounds are permitted for organic plant protection at max 6 kg Cu/ha/year. This was reduced from 8 kg in 2019. Used as fungicide only.', 'permitted_inputs', 'GB']
  );
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Organic Conversion Periods', 'Arable land requires 24 months conversion. Permanent crops require 36 months. Cattle require 12 months or 3/4 of life. Sheep and pigs require 6 months. Poultry require 10 weeks.', 'conversion', 'GB']
  );
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Cover Crops for Nitrogen Fixation', 'Crimson clover fixes 80-120 kg N/ha, sow Jul-Aug. Winter vetch fixes 60-120 kg N/ha, sow Aug-Oct. White clover fixes 100-200 kg N/ha in long-term leys.', 'cover_crops', 'GB']
  );
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Soil Health - Organic Matter', 'Target organic matter 3-6% for arable, 6-10% for grassland. Improve with cover crops, FYM, reduced tillage. Expect 5-10 years for measurable change.', 'soil_health', 'GB']
  );
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Biodiversity Net Gain - Wildflower Meadow', 'Wildflower meadow creation provides 4.0 BNG units/ha. Creation cost 3000-5000 GBP/ha. 30-year management obligation. CS higher-tier payment available.', 'biodiversity', 'GB']
  );

  return db;
}
