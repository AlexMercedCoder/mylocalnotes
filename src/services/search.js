import { db } from './db';
import { StorageService } from './storage';

export const SearchService = {
  async search(query) {
    if (!query) return { pages: [], blocks: [] };
    const lowerQuery = query.toLowerCase();
    const context = StorageService.getContext();
    if (!context.workspaceId) throw new Error("Not authenticated");

    // 1. Search Pages (Title)
    const allPages = await db.pages.where('workspaceId').equals(context.workspaceId).toArray();
    const matchedPages = allPages.filter(p => p.title && p.title.toLowerCase().includes(lowerQuery));

    // 2. Search Blocks (Content)
    // Note: This matches raw content. Encrypted blocks (strings) won't match unless decrypted.
    // For V1 performance, we only search readable content in DB.
    // Real full-text search on encrypted data would require building a secure index.
    const allBlocks = await db.blocks.where('workspaceId').equals(context.workspaceId).toArray();
    const matchedBlocks = allBlocks.filter(b => {
        if (typeof b.content === 'object' && b.content.text) {
            return b.content.text.toLowerCase().includes(lowerQuery);
        }
        return false;
    });

    return {
      pages: matchedPages,
      blocks: matchedBlocks
    };
  }
};
