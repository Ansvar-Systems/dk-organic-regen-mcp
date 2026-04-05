import BetterSqlite3 from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface Database {
  get<T>(sql: string, params?: unknown[]): T | undefined;
  all<T>(sql: string, params?: unknown[]): T[];
  run(sql: string, params?: unknown[]): void;
  close(): void;
  readonly instance: BetterSqlite3.Database;
}

export function createDatabase(dbPath?: string): Database {
  const resolvedPath =
    dbPath ??
    join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'database.db');
  const db = new BetterSqlite3(resolvedPath);

  db.pragma('journal_mode = DELETE');
  db.pragma('foreign_keys = ON');

  initSchema(db);

  return {
    get<T>(sql: string, params: unknown[] = []): T | undefined {
      return db.prepare(sql).get(...params) as T | undefined;
    },
    all<T>(sql: string, params: unknown[] = []): T[] {
      return db.prepare(sql).all(...params) as T[];
    },
    run(sql: string, params: unknown[] = []): void {
      db.prepare(sql).run(...params);
    },
    close(): void {
      db.close();
    },
    get instance() {
      return db;
    },
  };
}

function initSchema(db: BetterSqlite3.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organic_standards (
      id INTEGER PRIMARY KEY,
      certification_body TEXT NOT NULL,
      product_type TEXT NOT NULL,
      requirement TEXT NOT NULL,
      category TEXT,
      eu_regulation_ref TEXT,
      additional_to_eu INTEGER DEFAULT 0,
      jurisdiction = 'DK'
    );

    CREATE TABLE IF NOT EXISTS permitted_inputs (
      id INTEGER PRIMARY KEY,
      input_type TEXT NOT NULL,
      substance TEXT NOT NULL,
      annex TEXT,
      conditions TEXT,
      max_rate TEXT,
      derogation_available INTEGER,
      jurisdiction = 'DK'
    );

    CREATE TABLE IF NOT EXISTS conversion_rules (
      id INTEGER PRIMARY KEY,
      farm_type TEXT NOT NULL,
      conversion_period_months INTEGER,
      simultaneous_allowed INTEGER,
      in_conversion_marketing TEXT,
      support_available TEXT,
      conditions TEXT,
      jurisdiction = 'DK'
    );

    CREATE TABLE IF NOT EXISTS cover_crops (
      id INTEGER PRIMARY KEY,
      species TEXT NOT NULL,
      species_type TEXT,
      sowing_window TEXT,
      destruction_method TEXT,
      n_fixation_kg_ha REAL,
      biomass_t_ha REAL,
      good_before TEXT,
      purpose TEXT,
      jurisdiction = 'DK'
    );

    CREATE TABLE IF NOT EXISTS biodiversity_guidance (
      id INTEGER PRIMARY KEY,
      habitat_type TEXT NOT NULL,
      farm_feature TEXT,
      bng_units_per_ha REAL,
      creation_cost_per_ha REAL,
      management_obligation_years INTEGER,
      grant_available TEXT,
      jurisdiction = 'DK'
    );

    CREATE TABLE IF NOT EXISTS soil_health (
      id INTEGER PRIMARY KEY,
      indicator TEXT NOT NULL,
      target_range TEXT,
      measurement_method TEXT,
      management_practices TEXT,
      improvement_timeline TEXT,
      soil_type TEXT,
      jurisdiction = 'DK'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      title, body, topic, jurisdiction
    );

    CREATE TABLE IF NOT EXISTS db_metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('schema_version', '1.0');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('mcp_name', 'UK Organic & Regenerative MCP');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('jurisdiction = 'DK');
  `);
}

export function ftsSearch(
  db: Database,
  query: string,
  limit: number = 20
): { title: string; body: string; topic: string; jurisdiction: string; rank: number }[] {
  return db.all(
    `SELECT title, body, topic, jurisdiction, rank
     FROM search_index
     WHERE search_index MATCH ?
     ORDER BY rank
     LIMIT ?`,
    [query, limit]
  );
}
