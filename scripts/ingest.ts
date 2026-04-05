/**
 * Denmark Organic Regen MCP — Data Ingestion Script
 *
 * Populates SQLite database with Danish organic farming standards,
 * regenerative agriculture data, conversion rules, permitted inputs,
 * cover crops, biodiversity guidance, and soil health indicators.
 *
 * Sources: Landbrugsstyrelsen Økologivejledningen, Økologisk Landsforening,
 *          ICROFS, SEGES Innovation, Aarhus Universitet, EU 2018/848
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');
const now = new Date().toISOString().split('T')[0];

// ─── Clear existing data ──────────────────────────────────────────────────────
db.run('DELETE FROM organic_standards');
db.run('DELETE FROM permitted_inputs');
db.run('DELETE FROM conversion_rules');
db.run('DELETE FROM cover_crops');
db.run('DELETE FROM biodiversity_guidance');
db.run('DELETE FROM soil_health');
db.run('DELETE FROM search_index');

// ─── Organic Standards ────────────────────────────────────────────────────────

const organicStandards = [
  // Ø-mærket standards
  {
    certification_body: 'Fødevarestyrelsen (Ø-mærket / Det Røde Ø)',
    product_type: 'Kvæg (cattle)',
    requirement: '100% økologisk foder til kvæg. Obligatorisk afgræsning i vækstsæsonen (15. april - 1. november). Max 1 behandling/år (3 for malkekøer). Dobbelt tilbageholdelsestid. Homøopati foretrukket. Indendørs: min. 6 m²/dyr, udendørs: min. 4,5 m²/dyr.',
    category: 'Husdyrhold',
    eu_regulation_ref: 'EU 2018/848 Annex II, Part II',
    additional_to_eu: 1,
  },
  {
    certification_body: 'Fødevarestyrelsen (Ø-mærket / Det Røde Ø)',
    product_type: 'Svin (pigs)',
    requirement: '95% økologisk foder (max 5% konventionel undtagelse). Indendørs søer: min. 2,5 m², udendørs søer: min. 1,9 m². Indendørs slagtesvin: min. 1,3 m², udendørs slagtesvin: min. 1,0 m². Max 2 behandlinger/år. Dobbelt tilbageholdelsestid.',
    category: 'Husdyrhold',
    eu_regulation_ref: 'EU 2018/848 Annex II, Part II',
    additional_to_eu: 1,
  },
  {
    certification_body: 'Fødevarestyrelsen (Ø-mærket / Det Røde Ø)',
    product_type: 'Fjerkræ (poultry)',
    requirement: '95% økologisk foder. Indendørs: min. 6 m²/dyr (æglæggere), udendørs: min. 4 m²/dyr. Max 3.000 dyr per hus. Max 2 behandlinger/år. Dobbelt tilbageholdelsestid.',
    category: 'Husdyrhold',
    eu_regulation_ref: 'EU 2018/848 Annex II, Part II',
    additional_to_eu: 1,
  },
  {
    certification_body: 'Fødevarestyrelsen (Ø-mærket / Det Røde Ø)',
    product_type: 'Alle fødevarer',
    requirement: 'Statsligt dansk kontrolmærke for økologiske fødevarer. Strengere end EU-økologiforordningen på flere områder. Administreres af Fødevarestyrelsen. Forbud mod GMO. Forbud mod rutinemæssig medicinering.',
    category: 'Generelle regler',
    eu_regulation_ref: 'EU 2018/848',
    additional_to_eu: 1,
  },
  {
    certification_body: 'EU-økologilogo (Grønne blad)',
    product_type: 'Alle fødevarer',
    requirement: 'EU 2018/848 — obligatorisk på alle økologiske fødevarer i EU. Suppleret af Ø-mærket i Danmark. Forbud mod syntetiske pesticider og kunstgødning. Sædskifte. Dyrevelfærdskrav.',
    category: 'Generelle regler',
    eu_regulation_ref: 'EU 2018/848',
    additional_to_eu: 0,
  },
  // Subsidies
  {
    certification_body: 'Landbrugsstyrelsen',
    product_type: 'Omlægningstilskud',
    requirement: '5-årig tilskudsperiode under omlægning til økologi. Basissats: 1.050 DKK/ha. Differentieret sats for specialafgrøder: 1.200 DKK/ha (frugt, grønt, urter).',
    category: 'Tilskud',
    eu_regulation_ref: 'EU CAP Strategic Plan DK',
    additional_to_eu: 0,
  },
  {
    certification_body: 'Landbrugsstyrelsen',
    product_type: 'Opretholdelsestilskud',
    requirement: 'Årligt tilskud til opretholdelse af økologisk drift efter omlægningsperioden. Sats: 870 DKK/ha.',
    category: 'Tilskud',
    eu_regulation_ref: 'EU CAP Strategic Plan DK',
    additional_to_eu: 0,
  },
  // Market data
  {
    certification_body: 'Statistik (Økologisk Landsforening)',
    product_type: 'Markedsandel',
    requirement: 'Verdens højeste økologiske markedsandel: ~13% af total fødevareomsætning (2024). Stabil med vækst i foodservice.',
    category: 'Markedsdata',
    eu_regulation_ref: null,
    additional_to_eu: 0,
  },
  {
    certification_body: 'Statistik (Landbrugsstyrelsen)',
    product_type: 'Areal',
    requirement: 'Økologisk areal: ~12% af samlet landbrugsareal (~310.000 ha). Politisk mål: 25% inden 2030.',
    category: 'Markedsdata',
    eu_regulation_ref: null,
    additional_to_eu: 0,
  },
  {
    certification_body: 'Statistik (Økologifremme)',
    product_type: 'Offentlige køkkener',
    requirement: 'Gennemsnit ~30% økologi i offentlige køkkener (mål: 60% inden 2030). Program via Organic Denmark/Økologisk Landsforening.',
    category: 'Markedsdata',
    eu_regulation_ref: null,
    additional_to_eu: 0,
  },
];

for (const s of organicStandards) {
  db.run(
    `INSERT INTO organic_standards (certification_body, product_type, requirement, category, eu_regulation_ref, additional_to_eu, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'DK')`,
    [s.certification_body, s.product_type, s.requirement, s.category, s.eu_regulation_ref, s.additional_to_eu]
  );
}
console.log(`Inserted ${organicStandards.length} organic standards.`);

// ─── Permitted Inputs ─────────────────────────────────────────────────────────

const permittedInputs = [
  // Gødning (fertilizers)
  { input_type: 'Gødning', substance: 'Kalk og kalkmergel', annex: 'Annex II, EU 2018/848', conditions: 'Naturlig oprindelse. Ingen kemisk behandling.', max_rate: null, derogation_available: 0 },
  { input_type: 'Gødning', substance: 'Stenmjöl (kaliumfeldspar)', annex: 'Annex II, EU 2018/848', conditions: 'Naturlig mineralsk gødning. Ubehandlet.', max_rate: null, derogation_available: 0 },
  { input_type: 'Gødning', substance: 'Kompost (økologisk godkendt)', annex: 'Annex II, EU 2018/848', conditions: 'Fra økologisk produktion eller godkendt kilde. Ingen slam.', max_rate: '170 kg N/ha/år (total)', derogation_available: 0 },
  { input_type: 'Gødning', substance: 'Grøngødning (bælgplanter i rotation)', annex: 'Annex II, EU 2018/848', conditions: 'Kløver, lucerne, vikke. Del af obligatorisk sædskifte.', max_rate: null, derogation_available: 0 },
  { input_type: 'Gødning', substance: 'Dybstrøelse fra økologiske dyr', annex: 'Annex II, EU 2018/848', conditions: 'Kun fra økologiske bedrifter.', max_rate: '170 kg N/ha/år (total)', derogation_available: 0 },
  { input_type: 'Gødning', substance: 'Tang og havalgeprodukter', annex: 'Annex II, EU 2018/848', conditions: 'Naturlig oprindelse. Bæredygtig høst.', max_rate: null, derogation_available: 0 },
  { input_type: 'Gødning', substance: 'Benmel og blodmel', annex: 'Annex II, EU 2018/848', conditions: 'Undtagelse — kræver dokumentation for behov.', max_rate: null, derogation_available: 1 },
  { input_type: 'Gødning', substance: 'Vinasse (restprodukt fra sukkerproduktion)', annex: 'Annex II, EU 2018/848', conditions: 'Kaliumrig gødningskilde. Ikke ammoniumbaseret.', max_rate: null, derogation_available: 0 },

  // Plantebeskyttelse (plant protection)
  { input_type: 'Plantebeskyttelse', substance: 'Svovl', annex: 'Annex I, EU 2018/848', conditions: 'Svampebekæmpelse i frugt og grønt.', max_rate: 'Max 8 kg/ha/år', derogation_available: 0 },
  { input_type: 'Plantebeskyttelse', substance: 'Kobber', annex: 'Annex I, EU 2018/848', conditions: 'Svampebekæmpelse. Strengt reguleret. Akkumulering i jord overvåges.', max_rate: 'Max 4 kg/ha/år', derogation_available: 0 },
  { input_type: 'Plantebeskyttelse', substance: 'Bacillus thuringiensis (Bt)', annex: 'Annex I, EU 2018/848', conditions: 'Biologisk insektbekæmpelse. Specifik for larvemål.', max_rate: null, derogation_available: 0 },
  { input_type: 'Plantebeskyttelse', substance: 'Nyttedyr (snyltehvepse, nematoder, guldøjer)', annex: 'Annex I, EU 2018/848', conditions: 'Biologisk bekæmpelse af skadedyr. Ingen restriktioner.', max_rate: null, derogation_available: 0 },
  { input_type: 'Plantebeskyttelse', substance: 'Pyrethriner (naturlige)', annex: 'Annex I, EU 2018/848', conditions: 'Ekstrakt fra Chrysanthemum. Nedbrydelig. Bredspektret — forsigtig brug.', max_rate: null, derogation_available: 0 },
  { input_type: 'Plantebeskyttelse', substance: 'Jernfosfat', annex: 'Annex I, EU 2018/848', conditions: 'Sneglebekæmpelse. Nedbrydelig. Sikker for nyttedyr.', max_rate: null, derogation_available: 0 },
  { input_type: 'Plantebeskyttelse', substance: 'Kaliumbicarbonat', annex: 'Annex I, EU 2018/848', conditions: 'Svampebekæmpelse (meldug). Lav toksicitet.', max_rate: null, derogation_available: 0 },
];

for (const i of permittedInputs) {
  db.run(
    `INSERT INTO permitted_inputs (input_type, substance, annex, conditions, max_rate, derogation_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'DK')`,
    [i.input_type, i.substance, i.annex, i.conditions, i.max_rate, i.derogation_available]
  );
}
console.log(`Inserted ${permittedInputs.length} permitted inputs.`);

// ─── Conversion Rules ─────────────────────────────────────────────────────────

const conversionRules = [
  {
    farm_type: 'Etårige afgrøder (korn, grøntsager)',
    conversion_period_months: 24,
    simultaneous_allowed: 0,
    in_conversion_marketing: 'Afgrøderne kan ikke sælges som økologiske i omlægningsperioden. "Omlægningsvarer" tilladt efter 12 måneder til foder.',
    support_available: 'Omlægningstilskud: 1.050 DKK/ha i 5 år',
    conditions: '2 års omlægningsperiode fra sidste konventionelle behandling. Ingen syntetiske pesticider eller kunstgødning i perioden.',
  },
  {
    farm_type: 'Flerårige kulturer (frugt, bær, vedvarende)',
    conversion_period_months: 36,
    simultaneous_allowed: 0,
    in_conversion_marketing: 'Afgrøderne kan ikke sælges som økologiske i 3-årig omlægningsperiode.',
    support_available: 'Omlægningstilskud: 1.200 DKK/ha (specialafgrøder) i 5 år',
    conditions: '3 års omlægningsperiode for frugtplantager, bærbuske og vedvarende kulturer.',
  },
  {
    farm_type: 'Simultanomlægning (dyr + areal)',
    conversion_period_months: 24,
    simultaneous_allowed: 1,
    in_conversion_marketing: 'Hele bedriften omlægges samtidig. Dyr og areal følger samme tidsplan.',
    support_available: 'Omlægningstilskud: 1.050 DKK/ha i 5 år',
    conditions: 'Kræver at alt foder er økologisk fra omlægningstidspunktet. Hele bedriften skal omlægges — delvis omlægning ikke tilladt.',
  },
  {
    farm_type: 'Kvæg (cattle)',
    conversion_period_months: 12,
    simultaneous_allowed: 1,
    in_conversion_marketing: 'Mælk kan sælges som økologisk efter 6 måneder ved simultanomlægning. Kød efter 12 måneder.',
    support_available: 'Omlægningstilskud via areal',
    conditions: 'Økologisk foder fra dag 1 ved simultanomlægning. Adgang til udeareal. Afgræsning i sæsonen.',
  },
  {
    farm_type: 'Svin og fjerkræ',
    conversion_period_months: 6,
    simultaneous_allowed: 1,
    in_conversion_marketing: 'Produkter kan sælges som økologiske efter 6 måneders omlægning (dyr).',
    support_available: 'Omlægningstilskud via areal',
    conditions: 'Areal skal være omlægningsgodkendt. Foder 95% økologisk (5% konventionel undtagelse tilladt).',
  },
];

for (const c of conversionRules) {
  db.run(
    `INSERT INTO conversion_rules (farm_type, conversion_period_months, simultaneous_allowed, in_conversion_marketing, support_available, conditions, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'DK')`,
    [c.farm_type, c.conversion_period_months, c.simultaneous_allowed, c.in_conversion_marketing, c.support_available, c.conditions]
  );
}
console.log(`Inserted ${conversionRules.length} conversion rules.`);

// ─── Cover Crops ──────────────────────────────────────────────────────────────

const coverCrops = [
  {
    species: 'Olieræddike (Raphanus sativus)',
    species_type: 'Korsblomstret',
    sowing_window: 'August - september',
    destruction_method: 'Udvintrer (frostfølsom). Nedpløjning om foråret hvis nødvendigt.',
    n_fixation_kg_ha: 0,
    biomass_t_ha: 3.5,
    good_before: 'Vårkorn, kartofler, roer',
    purpose: 'Kvælstoffangst, biofumigation (mod nematoder), jordløsning (pælerod)',
  },
  {
    species: 'Gul sennep (Sinapis alba)',
    species_type: 'Korsblomstret',
    sowing_window: 'August - september',
    destruction_method: 'Udvintrer (frostfølsom). Mulches ned.',
    n_fixation_kg_ha: 0,
    biomass_t_ha: 3.0,
    good_before: 'Vårkorn, kartofler',
    purpose: 'Hurtig biomasse, kvælstoffangst, biofumigation, bestøvervenlig',
  },
  {
    species: 'Hvidkløver (Trifolium repens)',
    species_type: 'Bælgplante',
    sowing_window: 'April - august (udlæg i dæksæd)',
    destruction_method: 'Pløjning eller fræsning. Permanent i græsmarker.',
    n_fixation_kg_ha: 150,
    biomass_t_ha: 4.0,
    good_before: 'Vinterhvede, vinterrug',
    purpose: 'Kvælstoffiksering, jordstruktur, bestøverressource, flerårig dækning',
  },
  {
    species: 'Rødkløver (Trifolium pratense)',
    species_type: 'Bælgplante',
    sowing_window: 'April - august (udlæg i dæksæd)',
    destruction_method: 'Pløjning. 2-3 årig i kløvergræs.',
    n_fixation_kg_ha: 200,
    biomass_t_ha: 6.0,
    good_before: 'Vinterhvede, havre, kartofler',
    purpose: 'Kvælstoffiksering (højere end hvidkløver), dyb rodning, slætbar, foder',
  },
  {
    species: 'Lucerne (Medicago sativa)',
    species_type: 'Bælgplante',
    sowing_window: 'April - maj',
    destruction_method: 'Pløjning. 3-5 årig kultur.',
    n_fixation_kg_ha: 300,
    biomass_t_ha: 10.0,
    good_before: 'Vinterhvede, vårbyg',
    purpose: 'Meget høj kvælstoffiksering, dyb rodnet (2-5 m), tørketolerant, foderproduktion',
  },
  {
    species: 'Vikke (Vicia sativa)',
    species_type: 'Bælgplante',
    sowing_window: 'August - september (vintervikke) eller marts - april (vårvikke)',
    destruction_method: 'Nedpløjning. Vintervikke kan overvintre i milde vintre.',
    n_fixation_kg_ha: 120,
    biomass_t_ha: 4.0,
    good_before: 'Vårkorn, majs, kartofler',
    purpose: 'Kvælstoffiksering, grøngødning, jordstruktur, blanding med korn',
  },
  {
    species: 'Rajgræs (Lolium perenne / multiflorum)',
    species_type: 'Græs',
    sowing_window: 'April - september (udlæg i dæksæd eller ren udsæd)',
    destruction_method: 'Pløjning. Italiensk rajgræs (1-årig), alm. rajgræs (flerårig).',
    n_fixation_kg_ha: 0,
    biomass_t_ha: 5.0,
    good_before: 'Kartofler, roer, vårkorn',
    purpose: 'Kvælstoffangst, erosionsbeskyttelse, jordstruktur, foderproduktion',
  },
  {
    species: 'Ærter (Pisum sativum)',
    species_type: 'Bælgplante',
    sowing_window: 'Marts - april',
    destruction_method: 'Høst af frø, stubben nedpløjes.',
    n_fixation_kg_ha: 80,
    biomass_t_ha: 3.5,
    good_before: 'Vinterhvede, vinterbyg',
    purpose: 'Kvælstoffiksering, protein-afgrøde, salg som foder/fødevare',
  },
  {
    species: 'Hestebønner (Vicia faba)',
    species_type: 'Bælgplante',
    sowing_window: 'Marts - april',
    destruction_method: 'Høst af frø, stubben nedpløjes.',
    n_fixation_kg_ha: 150,
    biomass_t_ha: 5.0,
    good_before: 'Vinterhvede, havre',
    purpose: 'Kvælstoffiksering, proteinafgrøde, dyb rodnet, biavlsplante',
  },
  {
    species: 'Honningurt (Phacelia tanacetifolia)',
    species_type: 'Ikke-korsblomstret, ikke-bælgplante',
    sowing_window: 'August - september',
    destruction_method: 'Udvintrer (frostfølsom).',
    n_fixation_kg_ha: 0,
    biomass_t_ha: 2.5,
    good_before: 'Alle afgrøder (bryder sygdomscykler)',
    purpose: 'Bestøverressource, bryder korsblomst-rotation, kvælstoffangst, smukt blomstertæppe',
  },
];

for (const cc of coverCrops) {
  db.run(
    `INSERT INTO cover_crops (species, species_type, sowing_window, destruction_method, n_fixation_kg_ha, biomass_t_ha, good_before, purpose, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DK')`,
    [cc.species, cc.species_type, cc.sowing_window, cc.destruction_method, cc.n_fixation_kg_ha, cc.biomass_t_ha, cc.good_before, cc.purpose]
  );
}
console.log(`Inserted ${coverCrops.length} cover crops.`);

// ─── Biodiversity Guidance ────────────────────────────────────────────────────

const biodiversity = [
  {
    habitat_type: 'Blomsterstriber (flower strips)',
    farm_feature: 'Permanente striber langs markgrænser, 3-6 m bredde',
    bng_units_per_ha: 6.0,
    creation_cost_per_ha: 3500,
    management_obligation_years: 5,
    grant_available: 'Tilskud via miljøordninger (Landbrugsstyrelsen)',
  },
  {
    habitat_type: 'Levende hegn (hedgerows)',
    farm_feature: 'Flåede hegn med hjemmehørende arter: slåen, tjørn, hassel, hyld',
    bng_units_per_ha: 8.0,
    creation_cost_per_ha: 15000,
    management_obligation_years: 20,
    grant_available: 'Tilskud via Hegnsordningen',
  },
  {
    habitat_type: 'Vådområder (wetlands)',
    farm_feature: 'Genskabte vådområder, vandhuller, oversvømmelsesarealer',
    bng_units_per_ha: 10.0,
    creation_cost_per_ha: 25000,
    management_obligation_years: 20,
    grant_available: 'Vådområdeprojekter (Miljøstyrelsen)',
  },
  {
    habitat_type: 'Insektvolde (beetle banks)',
    farm_feature: 'Ophøjede jordvolde med tussockgræs, 2-3 m bredde, midt i mark',
    bng_units_per_ha: 4.0,
    creation_cost_per_ha: 2000,
    management_obligation_years: 5,
    grant_available: 'Tilskud via miljøordninger',
  },
  {
    habitat_type: 'Permanente græsarealer (permanent grassland)',
    farm_feature: 'Uopdyrket græs med naturlig flora, afgræsning eller sen slæt',
    bng_units_per_ha: 5.0,
    creation_cost_per_ha: 1000,
    management_obligation_years: 10,
    grant_available: 'Tilskud via Pleje af græs- og naturarealer',
  },
  {
    habitat_type: 'Agro-skovbrug (agroforestry)',
    farm_feature: 'Træer integreret i marker: æbler+korn, nødder+græs. Pilotprojekter i DK.',
    bng_units_per_ha: 9.0,
    creation_cost_per_ha: 30000,
    management_obligation_years: 20,
    grant_available: 'Projekttilskud via GUDP og forskningsmidler',
  },
  {
    habitat_type: 'Markskel og bræmmer (field margins)',
    farm_feature: 'Sprøjtefrie randzoner, 2 m bræmmer langs vandløb (lovpligtigt)',
    bng_units_per_ha: 3.0,
    creation_cost_per_ha: 500,
    management_obligation_years: 0,
    grant_available: 'Lovpligtigt — intet tilskud, men krav ved økologisk kontrol',
  },
  {
    habitat_type: 'Stendiger og jorddiger',
    farm_feature: 'Beskyttede landskabselementer (Naturbeskyttelsesloven § 4). Levested for padder, insekter.',
    bng_units_per_ha: 5.0,
    creation_cost_per_ha: 0,
    management_obligation_years: 0,
    grant_available: 'Fredede — må ikke fjernes. Vedligeholdelsespligt.',
  },
];

for (const b of biodiversity) {
  db.run(
    `INSERT INTO biodiversity_guidance (habitat_type, farm_feature, bng_units_per_ha, creation_cost_per_ha, management_obligation_years, grant_available, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'DK')`,
    [b.habitat_type, b.farm_feature, b.bng_units_per_ha, b.creation_cost_per_ha, b.management_obligation_years, b.grant_available]
  );
}
console.log(`Inserted ${biodiversity.length} biodiversity guidance entries.`);

// ─── Soil Health ──────────────────────────────────────────────────────────────

const soilHealth = [
  {
    indicator: 'Organisk kulstof (SOC)',
    target_range: '2-5% i pløjelaget (afhængig af jordtype)',
    measurement_method: 'Laboratorieanalyse: tør forbrænding (DACS). Prøver fra 0-25 cm.',
    management_practices: 'Efterafgrøder (0,3-0,5 t C/ha/år), kompostering (0,2-0,4 t C/ha/år), reduceret jordbearbejdning (0,1-0,3 t C/ha/år), agroforestry (0,5-1,0 t C/ha/år)',
    improvement_timeline: '5-20 år for målbar stigning',
    soil_type: 'Alle jordtyper',
  },
  {
    indicator: 'pH',
    target_range: 'Sandjord: 5,5-6,5. Lerjord: 6,0-7,0. Humusjord: 5,0-6,0.',
    measurement_method: 'Jordbundsanalyse (CaCl₂-metode). Minimum hvert 5. år.',
    management_practices: 'Kalkning med kalk/kalkmergel (godkendt i økologi). Undgå overkalkning.',
    improvement_timeline: '1-3 år',
    soil_type: 'Differentieret per jordtype',
  },
  {
    indicator: 'Fosfor (P)',
    target_range: 'Pt 2-4 (Olsen P: 15-25 mg/kg)',
    measurement_method: 'Olsen P-analyse. Jordbundsprøver hvert 3.-5. år.',
    management_practices: 'Stenmjöl, benmel, kompost. Undgå overgødskning (tab til vandmiljø).',
    improvement_timeline: '3-10 år (langsom opbygning)',
    soil_type: 'Alle jordtyper',
  },
  {
    indicator: 'Kalium (K)',
    target_range: 'Kt 8-12 (afhængig af lerindhold)',
    measurement_method: 'Ammoniumacetat-ekstraktion. Jordbundsprøver hvert 3.-5. år.',
    management_practices: 'Vinasse, stenmjöl, tang, dybstrøelse. Kløvergræs mobiliserer K fra undergrund.',
    improvement_timeline: '2-5 år',
    soil_type: 'Alle jordtyper',
  },
  {
    indicator: 'Jordstruktur / aggregatstabilitet',
    target_range: 'Stabil krummestruktur i pløjelag. Ingen pløjesål.',
    measurement_method: 'Spadeprøve (visuel vurdering). Penetrometermåling for kompaktering.',
    management_practices: 'Reduceret jordbearbejdning, efterafgrøder med dyb rod (olieræddike, lucerne), undgå kørsel på våd jord, kalkning.',
    improvement_timeline: '2-5 år',
    soil_type: 'Især lerjord og siltjord',
  },
  {
    indicator: 'Biologisk aktivitet (regnorme)',
    target_range: '>400 regnorme/m² i permanent græs, >150/m² i agerjord',
    measurement_method: 'Regnormetælling (sennepsvand-metode eller spadefuldsprøve, 25x25 cm).',
    management_practices: 'Reduceret jordbearbejdning, efterafgrøder, kompost, undgå kobber-akkumulering.',
    improvement_timeline: '3-7 år',
    soil_type: 'Alle jordtyper',
  },
  {
    indicator: 'Kvælstoflevering (N-min)',
    target_range: '50-150 kg N/ha/år (afhængig af forfrugt og jordtype)',
    measurement_method: 'N-min analyse (0-100 cm). Planteanalyse (NDVI/drone).',
    management_practices: 'Bælgplanter i sædskifte (min. 20%), grøngødning, kløvergræs (150-200 kg N/ha/år).',
    improvement_timeline: '1-3 år',
    soil_type: 'Alle jordtyper',
  },
  {
    indicator: 'Sædskifte-diversitet',
    target_range: 'Minimum 4-5 forskellige afgrøder i rotation. Min. 20% bælgplanter.',
    measurement_method: 'Markplan over 5-årig rotation. Diversitetsindeks.',
    management_practices: 'Obligatorisk rotation med bælgplanter (kløver, lucerne, ærter, hestebønner). Undgå mono-korn.',
    improvement_timeline: 'Umiddelbar effekt ved planlægning',
    soil_type: 'Alle jordtyper',
  },
];

for (const sh of soilHealth) {
  db.run(
    `INSERT INTO soil_health (indicator, target_range, measurement_method, management_practices, improvement_timeline, soil_type, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'DK')`,
    [sh.indicator, sh.target_range, sh.measurement_method, sh.management_practices, sh.improvement_timeline, sh.soil_type]
  );
}
console.log(`Inserted ${soilHealth.length} soil health indicators.`);

// ─── FTS5 Search Index ────────────────────────────────────────────────────────

// Index organic standards
for (const s of organicStandards) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'DK')`,
    [`${s.certification_body} — ${s.product_type}`, s.requirement, `organic_standards/${s.category}`]
  );
}

// Index permitted inputs
for (const i of permittedInputs) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'DK')`,
    [`${i.substance} (${i.input_type})`, `${i.conditions} ${i.max_rate ?? ''}`.trim(), `permitted_inputs/${i.input_type}`]
  );
}

// Index conversion rules
for (const c of conversionRules) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'DK')`,
    [`Omlægning: ${c.farm_type}`, `${c.conditions} ${c.in_conversion_marketing} ${c.support_available}`, 'conversion_rules']
  );
}

// Index cover crops
for (const cc of coverCrops) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'DK')`,
    [cc.species, `${cc.purpose} Saperiode: ${cc.sowing_window}. Biomasse: ${cc.biomass_t_ha} t/ha. N-fiksering: ${cc.n_fixation_kg_ha} kg/ha. God forfrugt til: ${cc.good_before}.`, 'cover_crops']
  );
}

// Index biodiversity
for (const b of biodiversity) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'DK')`,
    [b.habitat_type, `${b.farm_feature} Tilskud: ${b.grant_available}. BNG-enheder/ha: ${b.bng_units_per_ha}. Anlægsomkostning: ${b.creation_cost_per_ha} DKK/ha.`, 'biodiversity']
  );
}

// Index soil health
for (const sh of soilHealth) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'DK')`,
    [sh.indicator, `Målområde: ${sh.target_range}. Metode: ${sh.measurement_method}. Praksis: ${sh.management_practices}. Tidshorisont: ${sh.improvement_timeline}.`, 'soil_health']
  );
}

// Add regenerative agriculture topics
const regenTopics = [
  {
    title: 'Efterafgrøder (catch/cover crops)',
    body: 'Obligatorisk i økologi — 100% af arealet skal have efterafgrøder eller grøngødning. Godkendte arter: olieræddike, gul sennep, kløver, vikke, rajgræs. Kvælstofeffekt: 15-25 kg N/ha binding. Reducerer udvaskning, forbedrer jordstruktur, øger biodiversitet.',
    topic: 'regenerative/efterafgroeder',
  },
  {
    title: 'Sædskifte (crop rotation)',
    body: 'Obligatorisk rotation med bælgplanter (kløver, lucerne, ærter, hestebønner). Minimum 20% bælgplanter i rotation. Formål: kvælstoffiksering, sygdomsforebyggelse, jordforbedring. Typisk 5-7 årig rotation i dansk økologi.',
    topic: 'regenerative/saedskifte',
  },
  {
    title: 'Kulstofbinding (carbon sequestration)',
    body: 'Metoder til kulstofbinding i dansk landbrug: Efterafgrøder (0,3-0,5 t C/ha/år), Kompostering (0,2-0,4 t C/ha/år), Reduceret jordbearbejdning (0,1-0,3 t C/ha/år), Agroforestry (0,5-1,0 t C/ha/år). Danmark har mål om 55% CO₂-reduktion inden 2030.',
    topic: 'regenerative/kulstofbinding',
  },
  {
    title: 'Conservation Agriculture (CA)',
    body: 'No-till eller minimal jordbearbejdning. Udfordrende i økologi pga. mekanisk ukrudtsbekæmpelse (ingen herbicider). Pilotprojekter i DK viser potentiale. 3 principper: 1) Minimal jordbearbejdning, 2) Permanent jorddække, 3) Afgrødediversitet. SEGES Innovation og Aarhus Universitet forsker i CA-kompatible strategier for økologi.',
    topic: 'regenerative/conservation_agriculture',
  },
  {
    title: 'Agroforestry i Danmark',
    body: 'Træer integreret i landbrugssystemer. Pilotprojekter i DK med æbler+korn, nødder+græs. INRAE/AFAF referencer. Fordele: kulstofbinding, biodiversitet, mikroklima, erosionsbeskyttelse. Udfordring: landbrugsstøtte (EU CAP) tæller ikke altid træarealer som støtteberettiget. GUDP-finansierede demonstrationsprojekter.',
    topic: 'regenerative/agroforestry',
  },
  {
    title: 'Ø-mærket (Det Røde Ø)',
    body: 'Statsligt dansk kontrolmærke for økologiske fødevarer. Strengere end EU-økologiforordningen på flere områder. Administreres af Fødevarestyrelsen. 100% økologisk foder til kvæg. 95% økologisk foder til svin og fjerkræ (max 5% konventionel undtagelse). Forbud mod GMO. Forbud mod rutinemæssig medicinering. Danmarks mest kendte fødevaremærke — over 95% forbrugerkendskab.',
    topic: 'organic_standards/oe_maerket',
  },
  {
    title: 'Økologisk markedsdata Danmark',
    body: 'Verdens højeste økologiske markedsandel: ~13% af total fødevareomsætning (2024). Økologisk areal: ~12% af samlet landbrugsareal (~310.000 ha). Politisk mål: 25% inden 2030. Offentlige køkkener: gennemsnit ~30% (mål: 60% inden 2030). Dansk eksport af økologiske produkter: mejeriprodukter, æg, korn, grøntsager.',
    topic: 'market_data',
  },
  {
    title: 'Tilskud til økologisk landbrug',
    body: 'Omlægningstilskud: 1.050 DKK/ha (basissats), 1.200 DKK/ha (specialafgrøder: frugt, grønt, urter). 5-årig tilskudsperiode. Opretholdelsestilskud: 870 DKK/ha årligt efter omlægning. Ansøgning via Tast Selv (Landbrugsstyrelsen). Krav: autoriseret økologisk bedrift, årlig kontrol.',
    topic: 'subsidies',
  },
];

for (const rt of regenTopics) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'DK')`,
    [rt.title, rt.body, rt.topic]
  );
}

console.log(`Inserted search index entries.`);

// ─── Metadata ─────────────────────────────────────────────────────────────────

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'Danish Organic and Regenerative MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'DK')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('schema_version', '1.0')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('data_sources', 'Landbrugsstyrelsen Økologivejledningen, Økologisk Landsforening, ICROFS, SEGES Innovation, Aarhus Universitet')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('disclaimer', 'Data er vejledende. Kontakt Landbrugsstyrelsen for aktuelle økologiregler og tilskudssatser.')", []);

// ─── Coverage file ────────────────────────────────────────────────────────────

const totalRecords =
  organicStandards.length +
  permittedInputs.length +
  conversionRules.length +
  coverCrops.length +
  biodiversity.length +
  soilHealth.length;

writeFileSync(
  'data/coverage.json',
  JSON.stringify(
    {
      mcp_name: 'Danish Organic and Regenerative MCP',
      jurisdiction: 'DK',
      build_date: now,
      status: 'populated',
      record_counts: {
        organic_standards: organicStandards.length,
        permitted_inputs: permittedInputs.length,
        conversion_rules: conversionRules.length,
        cover_crops: coverCrops.length,
        biodiversity_guidance: biodiversity.length,
        soil_health: soilHealth.length,
        search_index_entries: totalRecords + regenTopics.length,
      },
      total_records: totalRecords,
      data_sources: [
        'Landbrugsstyrelsen Økologivejledningen',
        'Økologisk Landsforening',
        'ICROFS',
        'SEGES Innovation',
        'Aarhus Universitet',
        'EU 2018/848',
      ],
    },
    null,
    2
  )
);

db.close();
console.log(`\nDone. ${totalRecords} records + ${regenTopics.length} search topics inserted.`);
console.log('Database: data/database.db');
console.log('Coverage: data/coverage.json');
