import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlockEditor } from '../src/components/BlockEditor';
import { StorageService } from '../src/services/storage';
import { db } from '../src/services/db';
import { CryptoService } from '../src/services/crypto';

// Mock EditorJS
const mockSave = vi.fn();
const mockDestroy = vi.fn();
// We need to return a class
vi.mock('@editorjs/editorjs', () => {
  return {
    default: class EditorJS {
      constructor(config) {
        this.config = config;
        this.isReady = Promise.resolve();
        // Expose configuration for testing assertions
        this._data = config.data;
      }
      save() { return mockSave(); }
      destroy() { return mockDestroy(); }
    }
  };
});

// Mock Plugins
vi.mock('@editorjs/header', () => ({ default: class {} }));
vi.mock('@editorjs/list', () => ({ default: class {} }));
vi.mock('@editorjs/checklist', () => ({ default: class {} }));

describe('BlockEditor Logic', () => {
    let pageId = 'test-page';
    let context;

    beforeEach(async () => {
        await db.delete();
        await db.open();
        context = await CryptoService.deriveKeys('u', 'p');
        await StorageService.setContext(context.workspaceId, context.encryptionKey);
        
        // Reset Mocks
        mockSave.mockReset();
        mockSave.mockResolvedValue({ blocks: [] });
    });

    it('mount should load existing blocks from Storage', async () => {
        // Seed DB
        await StorageService.saveBlock({
            id: 'b1', parent_id: pageId, type: 'header', content: { text: "Hello" } 
        });

        const editor = new BlockEditor(pageId);
        await editor.mount();

        // Access the internal editor instance (via our mock class structure)
        expect(editor.editor).toBeDefined();
        // Check if data was passed to constructor
        expect(editor.editor._data.blocks).toHaveLength(1);
        expect(editor.editor._data.blocks[0].id).toBe('b1');
        expect(editor.editor._data.blocks[0].data.text).toBe('Hello');
    });

    it('save should sync changes (Create, Update, Delete)', async () => {
        // Initial State: [b1 (keep), b2 (delete)]
        await StorageService.saveBlock({ id: 'b1', parent_id: pageId, type: 'p', content: { text: "Keep Me" } });
        await StorageService.saveBlock({ id: 'b2', parent_id: pageId, type: 'p', content: { text: "Delete Me" } });

        const editor = new BlockEditor(pageId);
        await editor.mount(); // Loads initial state

        // Simulate Editor State: [b1 (updated), b3 (new)]
        // b2 is missing imply deletion
        mockSave.mockResolvedValue({
            blocks: [
                { id: 'b1', type: 'p', data: { text: "Updated Content" } },
                { id: 'b3', type: 'header', data: { text: "New Block" } }
            ]
        });

        // Trigger Save
        await editor.save();

        // Verify DB State
        const finalBlocks = await StorageService.getBlocks(pageId);
        expect(finalBlocks).toHaveLength(2);

        // Check Update
        const b1 = finalBlocks.find(b => b.id === 'b1');
        expect(b1.content.text).toBe("Updated Content");

        // Check Create
        const b3 = finalBlocks.find(b => b.id === 'b3');
        expect(b3).toBeDefined();
        expect(b3.type).toBe('header');

        // Check Delete
        const b2 = finalBlocks.find(b => b.id === 'b2');
        expect(b2).toBeUndefined();
    });
});
