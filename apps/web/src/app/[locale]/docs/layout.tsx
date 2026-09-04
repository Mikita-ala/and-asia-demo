import { redirect } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { getVisibleDocsTree } from "@/lib/docs-access";
import { requireActiveEmployee } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DocumentationLayout({
  children,
  params,
}: LayoutProps<"/[locale]/docs">) {
  const { locale } = await params;
  if (locale !== "ru") redirect("/ru/docs");

  const session = await requireActiveEmployee();
  const tree = await getVisibleDocsTree(session.user.id);

  return (
    <DocsLayout
      tree={tree}
      nav={{ title: "База знаний", url: "/ru/docs" }}
      links={[{ type: "button", text: "В рабочее пространство", url: "/ru/dashboard" }]}
      sidebar={{ collapsible: true }}
    >
      {children}
    </DocsLayout>
  );
}
