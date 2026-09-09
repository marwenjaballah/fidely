//prisma.config.ts

import { defineConfig, env } from "prisma/config";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const nodeEnv = process.env.NODE_ENV ?? 'development';
const envFile = path.join(projectRoot, `.env.${nodeEnv}`);
const fallbackEnvFile = path.join(projectRoot, '.env');

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else if (fs.existsSync(fallbackEnvFile)) {
  dotenv.config({ path: fallbackEnvFile });
}
const schemaPath = path.resolve(__dirname, "prisma", "schema.prisma");
const migrationsPath = path.resolve(__dirname, "prisma", "migrations");

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres?pgbouncer=true";
const directUrl = process.env.DIRECT_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
  schema: schemaPath,
  migrations: { path: migrationsPath },
  engine: "classic",
  datasource: {
    url: databaseUrl,
    directUrl: directUrl,
  },
});