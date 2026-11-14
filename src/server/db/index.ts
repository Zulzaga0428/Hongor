import "server-only";
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
