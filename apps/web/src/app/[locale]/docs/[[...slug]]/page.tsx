import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, LockKeyholeIcon, MailIcon } from "lucide-react";
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/docs/page";

import { getMDXComponents } from "@/components/mdx-components";
import { canViewDocsPage } from "@/lib/docs-access";
import { source } from "@/lib/docs";
import { requireActiveEmployee } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string; slug?: string[] }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);

  return {
    title: page ? `${page.data.title} — База знаний AND Asia` : "База знаний AND Asia",
    description: page?.data.description,
  };
}

export default async function DocumentationPage({ params }: Props) {
  const { locale, slug } = await params;
  if (locale !== "ru") notFound();

  const page = source.getPage(slug);
  if (!page) notFound();

  const session = await requireActiveEmployee();
  const allowed = await canViewDocsPage(session.user.id, page.data.resource);
  if (!allowed) {
    return <AccessRequest title={page.data.title} url={page.url} />;
  }

  const MDX = page.data.body;
  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

function AccessRequest({ title, url }: { title: string; url: string }) {
  const email = process.env.DOCUMENTATION_ACCESS_EMAIL;
  const subject = encodeURIComponent(`Помощь с материалом: ${title}`);
  const body = encodeURIComponent(`Здравствуйте! Помогите, пожалуйста, открыть материал «${title}": ${url}`);
  const href = email ? `mailto:${email}?subject=${subject}&body=${body}` : undefined;

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-2xl items-center px-5 py-10 sm:px-8">
      <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-muted text-foreground">
          <LockKeyholeIcon aria-hidden="true" className="size-5" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Ограниченный материал</p>
        <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Нет доступа к статье
        </h1>
        <p className="mt-3 max-w-xl text-pretty leading-7 text-muted-foreground">
          «{title}» пока недоступна в вашем рабочем пространстве. Если это важно для вашей работы, напишите нам.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {href ? (
            <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90" href={href}>
              <MailIcon aria-hidden="true" className="size-4" />
              Запросить доступ
            </a>
          ) : null}
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted" href="/ru/docs">
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            Вернуться в базу знаний
          </Link>
        </div>
      </div>
    </section>
  );
}
