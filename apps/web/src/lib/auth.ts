import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const trustedOrigins = [
  baseURL,
  "http://localhost:3000",
  "http://localhost:3001",
];

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("BETTER_AUTH_SECRET must be configured in production.");
}

export const auth = betterAuth({
  database: db,
  secret: secret ?? "development-only-secret-change-before-production",
  baseURL,
  trustedOrigins,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  // Session records intentionally stay in PostgreSQL. Redis must never be a
  // single point of failure that signs everybody out after a restart.
  advanced: { database: { joins: true } },
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.query(
            `INSERT INTO employees (user_id, status)
             VALUES ($1, 'pending')
             ON CONFLICT (user_id) DO NOTHING`,
            [user.id],
          );
        },
      },
    },
  },
});
