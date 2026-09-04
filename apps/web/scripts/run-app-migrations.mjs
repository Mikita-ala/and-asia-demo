import { readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to apply application migrations.");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
for (const filename of ["001-workforce.sql", "002-better-auth-1-7.sql", "003-employee-profiles.sql"]) {
  await client.query(await readFile(new URL(`../db/${filename}`, import.meta.url), "utf8"));
}
await client.end();
console.log("Application migrations completed.");
