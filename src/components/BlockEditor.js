import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Warning from '@editorjs/warning';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import Raw from '@editorjs/raw';
import { StorageService } from '../services/storage';

export class BlockEditor {
  constructor(pageId) {
    this.pageId = pageId;
    this.element = document.createElement('div');
    this.element.id = 'editorjs'; // EditorJS needs an ID
    this.editor = null;
    this.autoSaveTimer = null;
  }

  async mount() {
    // 1. Fetch existing blocks
    const dbBlocks = await StorageService.getBlocks(this.pageId);
    
    // 2. Map DB blocks to EditorJS format
    // DB: { id, type, content: { text: "..." }, ... }
    // EditorJS: { id, type, data: { text: "..." } }
    const editorData = {
      blocks: dbBlocks.map(b => ({
        id: b.id,
        type: b.type,
        data: b.content
      }))
    };

    // 3. Initialize Editor
    this.editor = new EditorJS({
      holder: this.element,
      data: editorData,
      placeholder: 'Type forward slash / to see commands',
      tools: {
        header: {
            class: Header,
            inlineToolbar: true,
            config: { placeholder: 'Heading' },
        },
        list: {
            class: List,
            inlineToolbar: true,
            config: { defaultStyle: 'unordered' }, 
        },
        checklist: {
            class: Checklist,
            inlineToolbar: true,
        },
        quote: {
            class: Quote,
            inlineToolbar: true,
            config: { quotePlaceholder: 'Enter a quote', captionPlaceholder: 'Quote caption' },
        },
        code: Code,
        delimiter: Delimiter,
        embed: Embed,
        table: {
            class: Table,
            inlineToolbar: true,
        },
        warning: Warning,
        raw: Raw, // HTML
        
        // Inline Tools
        marker: Marker,
        inlineCode: InlineCode,
        linkTool: LinkTool,
      },
      onChange: () => {
        this.triggerAutoSave();
      }
    });

    await this.editor.isReady;
  }

  triggerAutoSave() {
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.save(), 1000); // 1s debounce
  }

  async save() {
    if (!this.editor) return;

    try {
      const output = await this.editor.save();
      const newBlocks = output.blocks;
      
      // Get current state from DB to detect deletions
      const currentDbBlocks = await StorageService.getBlocks(this.pageId);
      const currentIds = new Set(currentDbBlocks.map(b => b.id));
      const newIds = new Set(newBlocks.map(b => b.id));

      // 1. Update / Create
      for (const block of newBlocks) {
        await StorageService.saveBlock({
          id: block.id,
          workspaceId: StorageService.getContext().workspaceId, // Ensure context
          parent_id: this.pageId,
          type: block.type,
          content: block.data,
          // Preserve other fields if update? 
          // saveBlock handles merge if we used a partial update, but it replaces.
          // For now, simple replacement is fine.
        });
      }

      // 2. Delete (Blocks in DB but not in Editor)
      for (const b of currentDbBlocks) {
        if (!newIds.has(b.id)) {
          await StorageService.deleteBlock(b.id); 
        }
      }
      
      console.log(`Saved ${newBlocks.length} blocks.`);
    } catch (e) {
      console.error("Autosave Failed", e);
    }
  }
  
  destroy() {
    clearTimeout(this.autoSaveTimer);
    // EditorJS destroy logic if needed, but usually removing DOM is enough for single page
    // if (this.editor) this.editor.destroy(); 
  }
}
