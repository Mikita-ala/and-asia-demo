import { defineDocs } from "fumadocs-mdx/macro";
import { loader } from "fumadocs-core/source";
import { z } from "zod";

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      resource: z.string(),
      section: z.string().default("Материалы"),
    }),
  },
});

export const source = loader({
  baseUrl: "/ru/docs",
  source: docs.toFumadocsSource(),
});
