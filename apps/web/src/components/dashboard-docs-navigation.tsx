import Link from "next/link";
import type { Node } from "fumadocs-core/page-tree";

function dashboardUrl(url: string) {
  return url.replace("/ru/docs", "/ru/dashboard/docs");
}

export function DashboardDocsNavigation({ nodes, activeUrl }: { nodes: Node[]; activeUrl: string }) {
  return (
    <nav aria-label="Навигация по базе знаний" className="space-y-1">
      {nodes.map((node) => {
        if (node.type === "separator") return null;

        if (node.type === "folder") {
          return (
            <div key={node.$id ?? String(node.name)} className="pt-4 first:pt-0">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {node.name}
              </p>
              {node.index ? <DashboardDocsNavigation nodes={[node.index]} activeUrl={activeUrl} /> : null}
              <DashboardDocsNavigation nodes={node.children} activeUrl={activeUrl} />
            </div>
          );
        }

        const href = dashboardUrl(node.url);
        const active = href === activeUrl;
        return (
          <Link
            key={node.$id ?? href}
            href={href}
            className={`flex min-h-10 items-center rounded-lg px-3 text-sm transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {node.name}
          </Link>
        );
      })}
    </nav>
  );
}
