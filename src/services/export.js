import { StorageService } from './storage';

export const ExportService = {
  async generateMarkdown(pageId) {
    const page = await StorageService.getPage(pageId);
    
    if (!page) throw new Error("Page not found");

    let md = `# ${page.title}\n\n`;
    
    // Fetch blocks
    const blocks = await StorageService.getBlocks(pageId);
    
    for (const block of blocks) {
      if (block.type === 'header') {
        const level = block.content.level || 2;
        md += `${'#'.repeat(level)} ${block.content.text}\n\n`;
      } else if (block.type === 'list') {
        const style = block.content.style === 'ordered' ? '1.' : '-';
        md += `${style} ${block.content.text}\n`; // List items usually compact
        // EditorJS list block might contain "items" array in one block or be separate blocks?
        // EditorJS List tool stores array of items in ONE block usually { style, items: [] }
        // BUT my Storage implementation seems to map 1:1?
        // Wait, EditorJS "List" output: { type: 'list', data: { style: 'ordered', items: ['a', 'b'] } }
        // So my BlockEditor saves THAT as one block.
        // So I need to iterate items.
        if (Array.isArray(block.content.items)) {
             block.content.items.forEach(item => {
                 md += `${style} ${item}\n`;
             });
             md += '\n';
        }
      } else if (block.type === 'checklist') {
        if (Array.isArray(block.content.items)) {
            block.content.items.forEach(item => {
                md += `- [${item.checked ? 'x' : ' '}] ${item.text}\n`;
            });
            md += '\n';
        }
      } else if (block.type === 'paragraph' || !block.type) { 
        // Default text
        md += `${block.content.text || ''}\n\n`;
      }
    }

    return md;
  },

  downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
