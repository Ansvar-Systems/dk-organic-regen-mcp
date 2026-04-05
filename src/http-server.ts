import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createDatabase, type Database } from './db.js';
import { handleAbout } from './tools/about.js';
import { handleListSources } from './tools/list-sources.js';
import { handleCheckFreshness } from './tools/check-freshness.js';
import { handleSearchOrganicGuidance } from './tools/search-organic-guidance.js';
import { handleGetOrganicStandards } from './tools/get-organic-standards.js';
import { handleGetConversionProcess } from './tools/get-conversion-process.js';
import { handleGetPermittedInputs } from './tools/get-permitted-inputs.js';
import { handleGetCoverCropGuidance } from './tools/get-cover-crop-guidance.js';
import { handleGetBiodiversityGuidance } from './tools/get-biodiversity-guidance.js';
import { handleGetSoilHealthGuidance } from './tools/get-soil-health-guidance.js';

const SERVER_NAME = 'dk-organic-regen-mcp';
const SERVER_VERSION = '0.1.0';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

const SearchArgsSchema = z.object({
  query: z.string(),
  topic: z.string().optional(),
  jurisdiction: z.string().optional(),
  limit: z.number().optional(),
});

const OrganicStandardsArgsSchema = z.object({
  product_type: z.string(),
  standard: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const ConversionArgsSchema = z.object({
  farm_type: z.string(),
  current_system: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const PermittedInputsArgsSchema = z.object({
  input_type: z.string(),
  crop_or_species: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const CoverCropArgsSchema = z.object({
  purpose: z.string().optional(),
  season: z.string().optional(),
  following_crop: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const BiodiversityArgsSchema = z.object({
  habitat_type: z.string().optional(),
  farm_feature: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const SoilHealthArgsSchema = z.object({
  indicator: z.string().optional(),
  soil_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const TOOLS = [
  {
    name: 'about',
    description: 'Get server metadata: name, version, coverage, data sources, and links.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'list_sources',
    description: 'List all data sources with authority, URL, license, and freshness info.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'check_data_freshness',
    description: 'Check when data was last ingested, staleness status, and how to trigger a refresh.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'search_organic_guidance',
    description: 'Search organic farming standards, regenerative practices, cover crops, soil health, and biodiversity guidance. Use for broad queries.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Free-text search query' },
        topic: { type: 'string', description: 'Filter by topic (e.g. organic_standards, cover_crops, soil_health, biodiversity, conversion, permitted_inputs)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
        limit: { type: 'number', description: 'Max results (default: 20, max: 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_organic_standards',
    description: 'Get organic certification requirements by product type and certification body. Covers Soil Association, OF&G, and EU baseline.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        product_type: { type: 'string', description: 'Product type (e.g. arable, dairy, beef_sheep, poultry, horticulture, processing)' },
        standard: { type: 'string', description: 'Certification body name filter (e.g. Soil Association, OF&G, EU Baseline)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
      required: ['product_type'],
    },
  },
  {
    name: 'get_conversion_process',
    description: 'Get organic conversion timeline, marketing options, and support for a farm type.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        farm_type: { type: 'string', description: 'Farm type (e.g. arable, permanent_grassland, permanent_crops, cattle, sheep_pigs, poultry)' },
        current_system: { type: 'string', description: 'Current farming system (e.g. conventional, low-input)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
      required: ['farm_type'],
    },
  },
  {
    name: 'get_permitted_inputs',
    description: 'Get permitted substances for organic farming by input type. Includes conditions, limits, and derogation status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input_type: { type: 'string', description: 'Input type: fertiliser, plant_protection, or feed_additive' },
        crop_or_species: { type: 'string', description: 'Optional crop or species context' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
      required: ['input_type'],
    },
  },
  {
    name: 'get_cover_crop_guidance',
    description: 'Get cover crop species recommendations with N fixation rates, biomass, sowing windows, and best preceding crop.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        purpose: { type: 'string', description: 'Purpose: nitrogen_fixation, biomass, biofumigation, pollinator, compaction_relief, weed_suppression' },
        season: { type: 'string', description: 'Sowing season filter (e.g. autumn, spring, summer)' },
        following_crop: { type: 'string', description: 'Following crop to find suitable cover crops for' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
    },
  },
  {
    name: 'get_biodiversity_guidance',
    description: 'Get biodiversity net gain guidance: BNG units, creation costs, management obligations, and grant options.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        habitat_type: { type: 'string', description: 'Habitat type (e.g. wildflower_meadow, hedgerow, woodland, pond)' },
        farm_feature: { type: 'string', description: 'Farm feature filter (e.g. field_margin, in_field, boundary)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
    },
  },
  {
    name: 'get_soil_health_guidance',
    description: 'Get soil health indicator targets, measurement methods, management practices, and improvement timelines.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        indicator: { type: 'string', description: 'Soil health indicator (e.g. organic_matter, earthworm_count, pH, bulk_density, water_infiltration)' },
        soil_type: { type: 'string', description: 'Soil type for context-specific targets (e.g. clay, sand, loam)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
    },
  },
];

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
}

function registerTools(server: Server, db: Database): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'about':
          return textResult(handleAbout());
        case 'list_sources':
          return textResult(handleListSources(db));
        case 'check_data_freshness':
          return textResult(handleCheckFreshness(db));
        case 'search_organic_guidance':
          return textResult(handleSearchOrganicGuidance(db, SearchArgsSchema.parse(args)));
        case 'get_organic_standards':
          return textResult(handleGetOrganicStandards(db, OrganicStandardsArgsSchema.parse(args)));
        case 'get_conversion_process':
          return textResult(handleGetConversionProcess(db, ConversionArgsSchema.parse(args)));
        case 'get_permitted_inputs':
          return textResult(handleGetPermittedInputs(db, PermittedInputsArgsSchema.parse(args)));
        case 'get_cover_crop_guidance':
          return textResult(handleGetCoverCropGuidance(db, CoverCropArgsSchema.parse(args)));
        case 'get_biodiversity_guidance':
          return textResult(handleGetBiodiversityGuidance(db, BiodiversityArgsSchema.parse(args)));
        case 'get_soil_health_guidance':
          return textResult(handleGetSoilHealthGuidance(db, SoilHealthArgsSchema.parse(args)));
        default:
          return errorResult(`Unknown tool: ${name}`);
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  });
}

const db = createDatabase();
const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: Server }>();

function createMcpServer(): Server {
  const mcpServer = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );
  registerTools(mcpServer, db);
  return mcpServer;
}

async function handleMCPRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
    return;
  }

  if (req.method === 'GET' || req.method === 'DELETE') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid or missing session ID' }));
    return;
  }

  const mcpServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await mcpServer.connect(transport);

  transport.onclose = () => {
    if (transport.sessionId) {
      sessions.delete(transport.sessionId);
    }
    mcpServer.close().catch(() => {});
  };

  await transport.handleRequest(req, res);

  if (transport.sessionId) {
    sessions.set(transport.sessionId, { transport, server: mcpServer });
  }
}

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', server: SERVER_NAME, version: SERVER_VERSION }));
    return;
  }

  if (url.pathname === '/mcp' || url.pathname === '/') {
    try {
      await handleMCPRequest(req, res);
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }));
      }
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

httpServer.listen(PORT, () => {
  console.log(`${SERVER_NAME} v${SERVER_VERSION} listening on port ${PORT}`);
});
