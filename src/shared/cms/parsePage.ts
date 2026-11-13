import {
  BLOCK_DATA_SCHEMAS,
  isBlockType,
  websitePageSchema,
  type Block,
  type WebsitePage,
} from "./schemas";

/**
 * Checks a `GET /pages/:key` response. A wrong envelope throws (the page can't render); a single
 * unknown or drifted section is dropped and logged, so the rest of the page still renders.
 */
export function parsePage(raw: unknown): WebsitePage {
  const page = websitePageSchema.parse(raw);
  const blocks: Block[] = [];
  for (const block of page.blocks) {
    if (!isBlockType(block.type)) {
      console.error(
        `[cms] ${page.key}: unknown section type "${block.type}" dropped`,
      );
      continue;
    }
    const data = BLOCK_DATA_SCHEMAS[block.type].safeParse(block.data);
    if (!data.success) {
      console.error(
        `[cms] ${page.key}: section "${block.type}" (${block.id}) dropped: ${data.error.message}`,
      );
      continue;
    }
    blocks.push({ ...block, type: block.type, data: data.data } as Block);
  }
  return { ...page, blocks };
}

/** The sections of one type (views pick their parts by type). */
export function blocksOfType<T extends Block["type"]>(
  page: WebsitePage,
  type: T,
): Extract<Block, { type: T }>[] {
  return page.blocks.filter(
    (block): block is Extract<Block, { type: T }> => block.type === type,
  );
}
