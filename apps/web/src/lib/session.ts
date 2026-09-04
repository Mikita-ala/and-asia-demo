import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}

export async function requireActiveEmployee() {
  const session = await requireSession();
  const result = await db.query<{ status: "pending" | "active" | "suspended" }>(
    "SELECT status FROM employees WHERE user_id = $1",
    [session.user.id],
  );

  if (result.rows[0]?.status !== "active") redirect("/welcome");
  return session;
}
