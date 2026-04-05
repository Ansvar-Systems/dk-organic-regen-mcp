# Tools Reference

## Meta Tools

### `about`

Get server metadata: name, version, coverage, data sources, and links.

**Parameters:** None

**Returns:** Server name, version, jurisdiction list, data source names, tool count, homepage/repository links.

---

### `list_sources`

List all data sources with authority, URL, license, and freshness info.

**Parameters:** None

**Returns:** Array of data sources, each with `name`, `authority`, `official_url`, `retrieval_method`, `update_frequency`, `license`, `coverage`, `last_retrieved`.

---

### `check_data_freshness`

Check when data was last ingested, staleness status, and how to trigger a refresh.

**Parameters:** None

**Returns:** `status` (fresh/stale/unknown), `last_ingest`, `days_since_ingest`, `staleness_threshold_days`, `refresh_command`.

---

## Domain Tools

### `search_organic_guidance`

Search organic farming standards, regenerative practices, cover crops, soil health, and biodiversity guidance. Use for broad queries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Free-text search query |
| `topic` | string | No | Filter by topic (organic_standards, cover_crops, soil_health, biodiversity, conversion, permitted_inputs) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Example:** `{ "query": "copper organic limit" }`

---

### `get_organic_standards`

Get organic certification requirements by product type and certification body. Covers Soil Association, OF&G, and EU baseline.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_type` | string | Yes | Product type (arable, dairy, beef_sheep, poultry, horticulture, processing) |
| `standard` | string | No | Certification body name filter (Soil Association, OF&G, EU Baseline) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Requirements grouped by certification body and category. Includes count of requirements additional to EU baseline.

**Example:** `{ "product_type": "dairy", "standard": "Soil Association" }`

---

### `get_conversion_process`

Get organic conversion timeline, marketing options, and support for a farm type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farm_type` | string | Yes | Farm type (arable, permanent_grassland, permanent_crops, cattle, sheep_pigs, poultry) |
| `current_system` | string | No | Current farming system (e.g. conventional, low-input) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Conversion period in months, simultaneous conversion option, in-conversion marketing rules, available support.

**Example:** `{ "farm_type": "cattle" }`

---

### `get_permitted_inputs`

Get permitted substances for organic farming by input type. Includes conditions, limits, and derogation status.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input_type` | string | Yes | Input type: fertiliser, plant_protection, or feed_additive |
| `crop_or_species` | string | No | Optional crop or species context |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** List of permitted substances with annex reference, conditions, maximum rate, and derogation availability.

**Example:** `{ "input_type": "plant_protection" }`

---

### `get_cover_crop_guidance`

Get cover crop species recommendations with N fixation rates, biomass, sowing windows, and best preceding crop.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `purpose` | string | No | Purpose: nitrogen_fixation, biomass, biofumigation, pollinator, compaction_relief, weed_suppression |
| `season` | string | No | Sowing season filter (e.g. autumn, spring, summer) |
| `following_crop` | string | No | Following crop to find suitable cover crops for |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Cover crop species with species type, sowing window, destruction method, N fixation (kg/ha), biomass (t/ha), good-before crops, and purpose.

**Example:** `{ "purpose": "nitrogen_fixation", "season": "Aug" }`

---

### `get_biodiversity_guidance`

Get biodiversity net gain guidance: BNG units, creation costs, management obligations, and grant options.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `habitat_type` | string | No | Habitat type (wildflower_meadow, hedgerow, woodland, pond) |
| `farm_feature` | string | No | Farm feature filter (field_margin, in_field, boundary) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Habitat types with BNG units/ha, creation cost, management obligation years, and available grants.

**Example:** `{ "habitat_type": "wildflower" }`

---

### `get_soil_health_guidance`

Get soil health indicator targets, measurement methods, management practices, and improvement timelines.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `indicator` | string | No | Soil health indicator (organic_matter, earthworm_count, pH, bulk_density, water_infiltration) |
| `soil_type` | string | No | Soil type for context-specific targets (clay, sand, loam) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Indicators with target range, measurement method, management practices, improvement timeline, and applicable soil type.

**Example:** `{ "indicator": "organic_matter" }`
