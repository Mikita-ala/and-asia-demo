import { NextResponse } from "next/server";
import { createFromSource } from "fumadocs-core/search/server";

import { canViewDocsPage } from "@/lib/docs-access";
import { source } from "@/lib/docs";
import { auth } from "@/lib/auth";

const search = createFromSource(source);

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const query = new URL(request.url).searchParams.get("query")?.trim();
  if (!query) return NextResponse.json([]);

  const results = await search.search(query);
  const visible = await Promise.all(
    results.map(async (result) => {
      const page = source.getPageByHref(result.url)?.page;
      if (!page || !(await canViewDocsPage(session.user.id, page.data.resource))) return null;
      return result;
    }),
  );

  return NextResponse.json(visible.filter((result) => result !== null));
}
