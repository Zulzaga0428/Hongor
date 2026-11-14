// "server-only"-г импортлохгүй: instrumentation.ts (react-server нөхцөлгүй) энийг ачаална.
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

/**
 * DATABASE_URL байвал жинхэнэ Postgres (Neon/Railway), байхгүй бол дотроо
 * ажилладаг PGlite (файлд хадгална) — демо гадны сангүйгээр ажиллана.
 * Хоёулаа ижил Postgres SQL тул код нэг.
 */

export type Db = NodePgDatabase<typeof schema>;

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  pin_hash text NOT NULL,
  role text NOT NULL DEFAULT 'student',
  level text NOT NULL DEFAULT 'anhan',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS assignments (
  id text PRIMARY KEY,
  level text NOT NULL,
  title text NOT NULL,
  instructions text NOT NULL,
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS submissions (
  id text PRIMARY KEY,
  assignment_id text NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer text NOT NULL,
  score integer,
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  graded_at timestamptz,
  UNIQUE (assignment_id, user_id)
);
CREATE TABLE IF NOT EXISTS applicants (
  user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  country text,
  program text,
  job_type text,
  last_name text,
  first_name text,
  birth_date text,
  gender text,
  address text,
  education text,
  experience text,
  height_cm integer,
  weight_kg integer,
  emergency_name text,
  emergency_phone text,
  consent_at timestamptz,
  submitted_at timestamptz,
  stage text NOT NULL DEFAULT 'registered',
  stage_at timestamptz NOT NULL DEFAULT now(),
  staff_note text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS applicants_stage_idx ON applicants (stage);
CREATE TABLE IF NOT EXISTS documents (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  filename text NOT NULL,
  mime text NOT NULL,
  size integer NOT NULL,
  data bytea NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  note text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS documents_user_idx ON documents (user_id);
CREATE TABLE IF NOT EXISTS stage_events (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage text NOT NULL,
  note text,
  by_name text,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stage_events_user_idx ON stage_events (user_id, at);
`;

async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({ connectionString: url, max: 5 });
    pool.on("error", (err) => console.error("Postgres pool алдаа (үргэлжилнэ):", err.message));
    await pool.query(DDL);
    return drizzle(pool, { schema });
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  await client.exec(DDL);
  // pglite ба node-postgres-ийн drizzle API ижил; төрлийг нэгтгэнэ.
  return drizzle(client, { schema }) as unknown as Db;
}

const g = globalThis as unknown as { __ktDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!g.__ktDb) {
    g.__ktDb = open().then(async (db) => {
      await seedIfEmpty(db);
      return db;
    });
    g.__ktDb.catch(() => {
      g.__ktDb = undefined;
    });
  }
  return g.__ktDb;
}

export { schema };
