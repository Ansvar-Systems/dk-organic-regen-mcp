# UK Organic & Regenerative MCP

[![CI](https://github.com/Ansvar-Systems/dk-organic-regen-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/dk-organic-regen-mcp/actions/workflows/ci.yml)
[![GHCR](https://github.com/Ansvar-Systems/dk-organic-regen-mcp/actions/workflows/ghcr-build.yml/badge.svg)](https://github.com/Ansvar-Systems/dk-organic-regen-mcp/actions/workflows/ghcr-build.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

UK organic farming standards and regenerative agriculture practices via the [Model Context Protocol](https://modelcontextprotocol.io). Organic certification, conversion process, permitted inputs, cover crop guidance, biodiversity net gain, and soil health indicators -- all from your AI assistant.

Part of [Ansvar Open Agriculture](https://ansvar.eu/open-agriculture).

## Why This Exists

Farmers converting to organic need quick access to certification requirements (Soil Association, OF&G), permitted input lists, conversion timelines, cover crop data, and soil health targets. This information is scattered across regulation text, certification body PDFs, and research publications. This MCP server puts it all in one place, searchable by AI assistants.

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "uk-organic-regen": {
      "command": "npx",
      "args": ["-y", "@ansvar/dk-organic-regen-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add uk-organic-regen npx @ansvar/dk-organic-regen-mcp
```

### Streamable HTTP (remote)

```
https://mcp.ansvar.eu/dk-organic-regen/mcp
```

### Docker (self-hosted)

```bash
docker run -p 3000:3000 ghcr.io/ansvar-systems/dk-organic-regen-mcp:latest
```

### npm (stdio)

```bash
npx @ansvar/dk-organic-regen-mcp
```

## Example Queries

Ask your AI assistant:

- "What are the Soil Association standards for organic arable farming?"
- "How long does organic conversion take for cattle?"
- "What cover crops fix the most nitrogen before spring cereals?"
- "What's the BNG unit value of creating a wildflower meadow?"
- "What inputs are permitted for organic plant protection?"
- "What soil health indicators should I measure and what are the targets?"
- "What is the copper limit for organic farming?"

## Stats

| Metric | Value |
|--------|-------|
| Tools | 10 (3 meta + 7 domain) |
| Jurisdiction | GB |
| Data sources | EU Reg 2018/848, Soil Association, OF&G, DEFRA BNG, AHDB |
| License (data) | Open Government Licence v3 / Published standards |
| License (code) | Apache-2.0 |
| Transport | stdio + Streamable HTTP |

## Tools

| Tool | Description |
|------|-------------|
| `about` | Server metadata and links |
| `list_sources` | Data sources with freshness info |
| `check_data_freshness` | Staleness status and refresh command |
| `search_organic_guidance` | FTS5 search across all organic and regen data |
| `get_organic_standards` | Certification requirements by product type and body |
| `get_conversion_process` | Conversion timeline, marketing options, support |
| `get_permitted_inputs` | Permitted substances with conditions and limits |
| `get_cover_crop_guidance` | Cover crop species with N fixation, biomass, sowing windows |
| `get_biodiversity_guidance` | BNG units, creation costs, management obligations |
| `get_soil_health_guidance` | Indicator targets, measurement methods, improvement timelines |

See [TOOLS.md](TOOLS.md) for full parameter documentation.

## Security Scanning

This repository runs security checks on every push:

- **CodeQL** -- static analysis for JavaScript/TypeScript
- **Gitleaks** -- secret detection across full history
- **Dependency review** -- via Dependabot
- **Container scanning** -- via GHCR build pipeline

See [SECURITY.md](SECURITY.md) for reporting policy.

## Disclaimer

This tool provides reference data for informational purposes only. It is not professional agricultural or certification advice. See [DISCLAIMER.md](DISCLAIMER.md).

## Contributing

Issues and pull requests welcome. For security vulnerabilities, email security@ansvar.eu (do not open a public issue).

## License

Apache-2.0. Data from government sources used under Open Government Licence v3. Certification body standards are publicly published reference material.
