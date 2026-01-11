import { StorageService } from './storage';
import { v4 as uuidv4 } from 'uuid';

export const DocsService = {
  async init() {
    const context = StorageService.getContext();
    if (!context || !context.workspaceId) return;

    const pages = await StorageService.getPages("ROOT");
    const existingHelp = pages.find(p => p.title === "📘 Help Center");

    if (!existingHelp) {
      console.log("Seeding Help Center...");
      await this.seedHelpCenter();
    }
  },

  async seedHelpCenter() {
    // Root Page
    const rootPage = await StorageService.createPage({ title: "📘 Help Center", parent_id: "ROOT" });

    // 1. Slash Commands
    const slashPage = await StorageService.createPage({ title: "Slash Commands", parent_id: rootPage.id });
    await this.addBlocks(slashPage.id, [
        { type: 'header', content: { text: "Slash Commands", level: 1 } },
        { type: 'paragraph', content: { text: "Type '/' to open the command menu. Available blocks:" } },
        { type: 'list', content: { style: 'unordered', items: ['Heading', 'List', 'Checklist', 'Quote', 'Code', 'Table', 'Warning'] } },
        { type: 'paragraph', content: { text: "Try it now by typing '/'!" } }
    ]);

    // 2. Encryption
    const securityPage = await StorageService.createPage({ title: "Encryption & Security", parent_id: rootPage.id });
    await this.addBlocks(securityPage.id, [
        { type: 'header', content: { text: "Security", level: 1 } },
        { type: 'paragraph', content: { text: "All data is encrypted in your browser using AES-GCM. We do not store your password." } },
        { type: 'warning', content: { title: "Important", message: "If you lose your password, your data cannot be recovered." } }
    ]);
    
    // 3. Databases
    const dbPage = await StorageService.createPage({ title: "Using Databases", parent_id: rootPage.id });
    await this.addBlocks(dbPage.id, [
        { type: 'header', content: { text: "Databases", level: 1 } },
        { type: 'paragraph', content: { text: "Create structured data with Tables and Kanban boards." } },
        { type: 'list', content: { style: 'ordered', items: ['Click "Create New Database" on home', 'Define Properties', 'Switch views between Table and Kanban'] } }
    ]);
  },

  async addBlocks(pageId, blocks) {
    for (const b of blocks) {
        await StorageService.saveBlock({
            id: uuidv4(),
            parent_id: pageId,
            type: b.type,
            content: b.content
        });
    }
  }
};
