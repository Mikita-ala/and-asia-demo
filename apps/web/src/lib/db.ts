import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL must be configured in production.");
}

export const db = new Pool({
  connectionString:
    connectionString ?? "postgres://andasia:andasia_local_password@localhost:55432/andasia",
});
