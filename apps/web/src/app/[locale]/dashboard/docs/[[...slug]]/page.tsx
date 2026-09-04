import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug?: string[] }>;
};

/**
 * Kept for existing bookmarks and internal links. The dedicated Fumadocs portal
 * is now the single place where the knowledge base is read.
 */
export default async function LegacyDashboardDocumentationPage({ params }: Props) {
  const { slug } = await params;
  const path = slug?.length ? `/${slug.map(encodeURIComponent).join("/")}` : "";

  redirect(`/ru/docs${path}`);
}
