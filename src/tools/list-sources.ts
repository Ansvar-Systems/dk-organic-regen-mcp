import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'EU Regulation 2018/848 on Organic Production',
      authority: 'European Commission (retained in UK law)',
      official_url: 'https://www.legislation.gov.uk/eur/2018/848',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as amended',
      license: 'Open Government Licence v3',
      coverage: 'Organic production rules, conversion periods, permitted inputs, labelling',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Soil Association Organic Standards',
      authority: 'Soil Association Certification',
      official_url: 'https://www.soilassociation.org/our-standards/',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'annual',
      license: 'Published standards (public reference)',
      coverage: 'Additional requirements beyond EU baseline for all product types',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'OF&G Organic Standards',
      authority: 'Organic Farmers & Growers CIC',
      official_url: 'https://ofgorganic.org/useful-info/organic-standards',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'annual',
      license: 'Published standards (public reference)',
      coverage: 'UK organic certification requirements aligned with EU baseline',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'DEFRA Biodiversity Net Gain Guidance',
      authority: 'Department for Environment, Food and Rural Affairs',
      official_url: 'https://www.gov.uk/government/collections/biodiversity-net-gain',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as updated',
      license: 'Open Government Licence v3',
      coverage: 'BNG unit calculations, habitat types, management obligations',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'AHDB Cover Crop and Soil Health Research',
      authority: 'Agriculture and Horticulture Development Board',
      official_url: 'https://ahdb.org.uk/knowledge-library/cover-crops',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as published',
      license: 'Open Government Licence v3',
      coverage: 'Cover crop species data, soil health indicators, management practices',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk/eur/2018/848' }),
  };
}
