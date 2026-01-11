export class ShortcutsModal {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'shortcuts-modal-overlay hidden';
    this.element.innerHTML = `
      <div class="shortcuts-modal">
        <h2>⌨️ Keyboard Shortcuts</h2>
        <div class="shortcuts-grid">
            <div class="shortcut-group">
                <h3>Navigation</h3>
                <div class="shortcut-item"><span>Cmd+K</span> <span>Search</span></div>
                <div class="shortcut-item"><span>?</span> <span>Show Shortcuts</span></div>
            </div>
            <div class="shortcut-group">
                <h3>Editor</h3>
                <div class="shortcut-item"><span>/</span> <span>Command Menu</span></div>
                <div class="shortcut-item"><span>Cmd+S</span> <span>Save (Auto)</span></div>
                <div class="shortcut-item"><span>Enter</span> <span>New Block</span></div>
                <div class="shortcut-item"><span>Backspace</span> <span>Delete Block</span></div>
            </div>
             <div class="shortcut-group">
                <h3>Markdown</h3>
                <div class="shortcut-item"><span># Space</span> <span>Heading 1</span></div>
                <div class="shortcut-item"><span>## Space</span> <span>Heading 2</span></div>
                <div class="shortcut-item"><span>- Space</span> <span>List</span></div>
                <div class="shortcut-item"><span>> Space</span> <span>Quote</span></div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="close-shortcuts">Close</button>
        </div>
      </div>
    `;
    
    this.element.addEventListener('click', (e) => {
        if (e.target === this.element) this.close();
    });
    
    this.element.querySelector('#close-shortcuts').onclick = () => this.close();

    document.addEventListener('keydown', (e) => {
        if (e.key === '?' && !['INPUT', 'TEXTAREA', 'DIV'].includes(document.activeElement.tagName)) {
             // Only if not typing in editor (DIV contenteditable check is tricky, relying on editor bubbling stop?)
             // Actually editor captures a lot. We might need Ctrl+? or Alt+? to be safe.
             // Or check if activeElement is body.
             if (document.activeElement === document.body) {
                 this.open();
             }
        }
        if (e.key === 'Escape') this.close();
    });
  }

  open() {
    this.element.classList.remove('hidden');
  }

  close() {
    this.element.classList.add('hidden');
  }
}
