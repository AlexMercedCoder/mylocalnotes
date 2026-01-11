import { StorageService } from '../services/storage';

export class TrashModal {
  constructor(onClose) {
    this.onClose = onClose;
    this.element = document.createElement('div');
    this.element.className = 'shortcuts-modal-overlay'; // Reuse style
    this.render();
  }

  async render() {
    const trash = await StorageService.getTrash();
    
    this.element.innerHTML = `
      <div class="shortcuts-modal" style="max-width: 500px;">
        <h2>🗑️ Trash Bin</h2>
        <div class="trash-list" style="margin: 2rem 0; max-height: 300px; overflow-y: auto;">
            ${trash.length === 0 ? '<p>Trash is empty.</p>' : ''}
            <ul style="list-style: none; padding: 0;">
                ${trash.map(p => `
                    <li style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #eee;">
                        <span>${p.title}</span>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-restore" data-id="${p.id}" style="background: #4caf50; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">Restore</button>
                            <button class="btn-delete" data-id="${p.id}" style="background: #f44336; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">Delete</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
        <div class="modal-footer">
            <button id="close-trash">Close</button>
        </div>
      </div>
    `;

    this.element.addEventListener('click', (e) => {
       if (e.target === this.element) this.onClose();
       if (e.target.id === 'close-trash') this.onClose();
       
       if (e.target.classList.contains('btn-restore')) {
           this.handleRestore(e.target.dataset.id);
       }
       if (e.target.classList.contains('btn-delete')) {
           this.handleDelete(e.target.dataset.id);
       }
    });
  }

  async handleRestore(id) {
    await StorageService.restorePage(id);
    this.render();
  }

  async handleDelete(id) {
    if (confirm("Permanently delete this page?")) {
        await StorageService.permanentDeletePage(id);
        this.render();
    }
  }
}
