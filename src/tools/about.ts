import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'UK Organic & Regenerative MCP',
    description:
      'UK organic farming standards and regenerative agriculture practices via MCP. Covers organic ' +
      'certification (Soil Association, OF&G), conversion process, permitted inputs, cover crop ' +
      'guidance, biodiversity net gain, and soil health indicators.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'EU Regulation 2018/848 (retained in UK law)',
      'Soil Association Standards',
      'OF&G Standards',
      'DEFRA Environmental Land Management',
      'AHDB Cover Crop Research',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/Ansvar-Systems/dk-organic-regen-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
