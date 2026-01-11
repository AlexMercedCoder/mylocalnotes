import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchService } from '../src/services/search';
import { ExportService } from '../src/services/export';
import { StorageService } from '../src/services/storage';
import { db } from '../src/services/db';
import { CryptoService } from '../src/services/crypto';

describe('Advanced Features', () => {
    let context;
    let pageId;

    beforeEach(async () => {
        await db.delete();
        await db.open();
        context = await CryptoService.deriveKeys('u', 'p');
        await StorageService.setContext(context.workspaceId, context.encryptionKey);
        
        // Seed
        const page = await StorageService.createPage({ title: "My Targets", parent_id: "ROOT" });
        pageId = page.id;
        await StorageService.saveBlock({ 
            id: 'b1', parent_id: pageId, type: 'header', content: { text: "Goals", level: 1 } 
        });
        await StorageService.saveBlock({ 
            id: 'b2', parent_id: pageId, type: 'paragraph', content: { text: "This is a meaningful text." } 
        });
    });

    it('SearchService should find pages by title', async () => {
        const results = await SearchService.search("Targets");
        expect(results.pages).toHaveLength(1);
        expect(results.pages[0].title).toBe("My Targets");
    });

    it('SearchService should find blocks by content', async () => {
        const results = await SearchService.search("meaningful");
        expect(results.blocks).toHaveLength(1);
        expect(results.blocks[0].content.text).toContain("meaningful");
    });

    it('ExportService should generate Markdown', async () => {
        const md = await ExportService.generateMarkdown(pageId);
        
        expect(md).toContain("# My Targets"); // Page Title
        expect(md).toContain("# Goals"); // Header block
        expect(md).toContain("This is a meaningful text."); // Paragraph
    });
});
