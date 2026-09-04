import "server-only";

import type { Node, Root } from "fumadocs-core/page-tree";

import { canViewDocument } from "@/lib/openfga";
import { source } from "@/lib/docs";

export async function canViewDocsPage(userId: string, resourceId: string) {
  return canViewDocument(userId, resourceId);
}

export async function getVisibleDocsTree(userId: string): Promise<Root> {
  async function filterNodes(nodes: Node[]): Promise<Node[]> {
    const visible = await Promise.all(
      nodes.map(async (node): Promise<Node | null> => {
        if (node.type === "separator") return node;

        if (node.type === "folder") {
          const children = await filterNodes(node.children);
          const index = node.index
            ? await filterNodes([node.index]).then(([item]) => item)
            : undefined;

          if (children.length === 0 && !index) return null;
          return { ...node, children, index: index?.type === "page" ? index : undefined };
        }

        const page = source.getPageByHref(node.url)?.page;
        if (!page || !(await canViewDocsPage(userId, page.data.resource))) return null;
        return node;
      }),
    );

    return visible.filter((node): node is Node => node !== null);
  }

  const tree = source.getPageTree();
  return { ...tree, children: await filterNodes(tree.children) };
}
