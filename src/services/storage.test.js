import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from './storage';
import { CryptoService } from './crypto';
import { db } from './db';

describe('StorageService', () => {
  let contextA;
  
  beforeEach(async () => {
    // Clear DB
    await db.delete();
    await db.open();

    // Setup Context A
    contextA = await CryptoService.deriveKeys('UserA', 'passA');
    await StorageService.setContext(contextA.workspaceId, contextA.encryptionKey);
  });

  it('should seed welcome page on first login', async () => {
    const pages = await StorageService.getPages("ROOT");
    expect(pages).toHaveLength(1);
    expect(pages[0].title).toContain('Welcome');
  });

  it('should save and retrieve blocks', async () => {
    const root = (await StorageService.getPages("ROOT"))[0];
    
    const block = await StorageService.saveBlock({
      parent_id: root.id,
      type: 'text',
      content: { text: "Hello World" }
    });
    
    const fetched = await StorageService.getBlocks(root.id);
    expect(fetched).toHaveLength(3); // 2 seed blocks + 1 new
    expect(fetched.find(b => b.id === block.id).content.text).toBe("Hello World");
  });

  it('should encrypt sensitive blocks', async () => {
    const root = (await StorageService.getPages("ROOT"))[0];
    
    const block = await StorageService.saveBlock({
      parent_id: root.id,
      type: 'secret',
      isSensitive: true,
      content: { text: "Super Secret" }
    });
    
    // 1. Check raw DB - should be encrypted
    const rawBlock = await db.blocks.get(block.id);
    expect(typeof rawBlock.content).toBe('string'); // Encrypted string
    expect(rawBlock.content).not.toContain('Super Secret');
    
    // 2. Check Service - should be decrypted
    const fetched = await StorageService.getBlocks(root.id);
    const serviceBlock = fetched.find(b => b.id === block.id);
    expect(serviceBlock.content).toEqual({ text: "Super Secret" });
  });

  it('should NOT return data from other workspaces', async () => {
    // User A creates a page
    await StorageService.createPage({ title: "Page A" });
    
    // Switch to User B
    const contextB = await CryptoService.deriveKeys('UserB', 'passB');
    await StorageService.setContext(contextB.workspaceId, contextB.encryptionKey);
    
    // Should verify seed happens for User B (separate workspace)
    const pagesB = await StorageService.getPages("ROOT");
    expect(pagesB).toHaveLength(1); // Only Welcome page
    expect(pagesB[0].title).toBe("Welcome to My Local Notes");
    
    // Verify Page A is NOT visible
    const allPages = await StorageService.getPages("ROOT");
    const pageATitle = allPages.find(p => p.title === "Page A");
    expect(pageATitle).toBeUndefined();
  });
});
