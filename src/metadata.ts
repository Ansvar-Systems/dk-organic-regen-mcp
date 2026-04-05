export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'Data er vejledende. Kontakt Landbrugsstyrelsen for aktuelle økologiregler og tilskudssatser. ' +
  'Certificeringskrav varierer — tjek altid med din kontrollør (Fødevarestyrelsen) før beslutninger. ' +
  'Efterafgrøde- og jordsundhedsdata er indikative — kontakt din planteavlskonsulent for stedspecifik rådgivning.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://lbst.dk/landbrug/oekologi/',
    copyright: 'Data: Landbrugsstyrelsen, Økologisk Landsforening, ICROFS, SEGES Innovation, Aarhus Universitet. Server: Apache-2.0 Ansvar Systems.',
    server: 'Danish Organic and Regenerative MCP',
    version: '0.1.0',
    ...overrides,
  };
}
