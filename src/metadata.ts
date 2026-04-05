export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'This server provides general guidance on organic standards and regenerative practices. ' +
  'Certification requirements vary by body — always check with your certifier (Soil Association, ' +
  'OF&G, etc.) before making management decisions. Cover crop and soil health data are indicative — ' +
  'consult your agronomist for site-specific advice.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.legislation.gov.uk/eur/2018/848',
    copyright: 'Data: Crown Copyright and certification body publications. Server: Apache-2.0 Ansvar Systems.',
    server: 'dk-organic-regen-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
