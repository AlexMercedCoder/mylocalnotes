import { db } from './db';
import { CryptoService } from './crypto';
import { v4 as uuidv4 } from 'uuid';

let currentWorkspaceId = null;
let currentKey = null;

export const StorageService = {
  /**
   * Initialize the storage context after login.
   * @param {string} workspaceId 
   * @param {CryptoKey} encryptionKey 
   */
  async setContext(workspaceId, encryptionKey) {
    if (!workspaceId || !encryptionKey) throw new Error("Invalid context");
    currentWorkspaceId = workspaceId;
    currentKey = encryptionKey;
    
    await this.seedIfNeeded();
  },

  getContext() {
    return { workspaceId: currentWorkspaceId };
  },

  /**
   * Check if workspace is empty and create seed data.
   */
  async seedIfNeeded() {
    const count = await db.pages.where('workspaceId').equals(currentWorkspaceId).count();
    if (count === 0) {
      const rootPageId = uuidv4();
      await this.createPage({
        id: rootPageId,
        title: "Welcome to My Local Notes",
        parent_id: "ROOT"
      });

      // Add some instructions
      await this.saveBlock({
        id: uuidv4(),
        parent_id: rootPageId,
        type: "paragraph",
        content: { text: "This is your secure, offline notebook." }
      });
      
      await this.saveBlock({
        id: uuidv4(),
        parent_id: rootPageId,
        type: "paragraph",
        content: { text: "Try creating a new page or marking a block as sensitive!" }
      });
    }
  },

  /**
   * Create or overwrite a Page.
   */
  async createPage({ id, title, parent_id }) {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    const pageId = id || uuidv4();
    const doc = {
      id: pageId,
      workspaceId: currentWorkspaceId,
      title,
      parent_id: parent_id || "ROOT",
      created_at: Date.now(),
      updated_at: Date.now()
    };
    await db.pages.put(doc);
    return doc;
  },

  /**
   * Get all pages at a specific level (root if null).
   */
  async getPages(parentId = "ROOT") {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    // IndexedDB/Dexie handles null in index queries
    return await db.pages
      .where('[workspaceId+parent_id]')
      .equals([currentWorkspaceId, parentId])
      .toArray();
  },

  /**
   * Get a single page by ID.
   */
  async getPage(id) {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    const page = await db.pages.get(id);
    // Security check: ensure page belongs to current workspace
    if (page && page.workspaceId === currentWorkspaceId) {
        return page;
    }
    return null;
  },

  /**
   * Save a block (Create or Update). Handles encryption.
   */
  async saveBlock(block) {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    
    let contentToStore = block.content;
    
    // Encrypt if sensitive
    if (block.isSensitive) {
      if (!contentToStore) contentToStore = {}; 
      // Encrypt the content object to a string
      contentToStore = await CryptoService.encrypt(contentToStore, currentKey);
    }

    const doc = {
      ...block,
      id: block.id || uuidv4(),
      workspaceId: currentWorkspaceId,
      content: contentToStore,
      updated_at: Date.now()
    };
    
    if (!doc.created_at) doc.created_at = Date.now();

    await db.blocks.put(doc);
    return doc;
  },

  /**
   * Get all blocks for a page, decrypting if necessary.
   */
  async getBlocks(parentId) {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    
    const blocks = await db.blocks
      .where('[workspaceId+parent_id]')
      .equals([currentWorkspaceId, parentId])
      .toArray();

    // Decrypt in parallel
    return Promise.all(blocks.map(async (b) => {
      if (b.isSensitive && typeof b.content === 'string') {
        try {
          b.content = await CryptoService.decrypt(b.content, currentKey);
        } catch (e) {
          b.content = { text: "⚠️ Decryption Failed" };
          b.error = true;
        }
      }
      return b;
    }));
  },

  /**
   * Delete a block by ID.
   */
  async deleteBlock(id) {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    await db.blocks.delete(id);
  },

  // --- Database Features ---

  /**
   * Create or Update a Database definition.
   * @param {Object} dbObj { id?, title, properties }
   */
  async saveDatabase({ id, title, properties }) {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    const dbId = id || uuidv4();
    const doc = {
      id: dbId,
      workspaceId: currentWorkspaceId,
      title,
      properties, // Schema definition
      updated_at: Date.now()
    };
    if (!id) doc.created_at = Date.now();
    await db.databases.put(doc);
    return doc;
  },

  async getDatabase(id) {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    return await db.databases.get(id);
  },

  async getAllDatabases() {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    return await db.databases.where('workspaceId').equals(currentWorkspaceId).toArray();
  },

  /**
   * Update the structured properties of a Page (Row).
   */
  async updatePageProperties(pageId, properties) {
    if (!currentWorkspaceId) throw new Error("Not authenticated");
    
    // We need to fetch, merge, and put because we might overwrite other fields if we aren't careful, 
    // although db.pages.update() is better for this.
    await db.pages.update(pageId, {
      properties, 
      updated_at: Date.now()
    });
  }
};
