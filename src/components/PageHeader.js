import { StorageService } from '../services/storage';

export class PageHeader {
  constructor(page, onUpdate) {
    this.page = page;
    this.onUpdate = onUpdate;
    this.element = document.createElement('div');
    this.element.className = 'page-header';
    this.render();
  }

  render() {
    const coverColor = this.page.cover || 'linear-gradient(90deg, #a8c0ff 0%, #3f2b96 100%)'; // default
    const icon = this.page.icon || '📄';

    this.element.innerHTML = `
        <div class="page-cover" style="background: ${coverColor}; height: 150px; border-radius: 8px 8px 0 0; position: relative;">
            <button class="btn-change-cover" style="position: absolute; right: 10px; bottom: 10px; opacity: 0.5;">Change Cover</button>
        </div>
        <div class="page-header-content" style="padding: 0 2rem; margin-top: -30px; position: relative;">
            <div class="page-icon" style="font-size: 4rem; cursor: pointer;">${icon}</div>
            <h1 class="page-title" contenteditable="true" style="margin: 0.5rem 0; outline: none;">${this.page.title}</h1>
        </div>
        <div class="page-controls" style="padding: 0 2rem; margin-bottom: 2rem; display: flex; gap: 1rem; color: #888; font-size: 0.9rem;">
            <span class="btn-add-icon" style="cursor: pointer;">${this.page.icon ? 'Change Icon' : 'Add Icon'}</span>
            <span class="btn-add-cover" style="cursor: pointer;">${this.page.cover ? 'Change Cover' : 'Add Cover'}</span>
            <span class="btn-templates" style="cursor: pointer;">📄 Templates</span>
            <span class="btn-view-opts" style="cursor: pointer;">👁️ View</span>
        </div>
        <div class="view-menu hidden" style="position: absolute; right: 0; background: var(--color-surface); border: 1px solid var(--color-border); padding: 1rem; z-index: 10;">
            <label style="display: block; margin-bottom: 0.5rem;"><input type="checkbox" id="toggle-full-width"> Full Width</label>
            <label style="display: block;"><input type="checkbox" id="toggle-small-text"> Small Text</label>
        </div>
    `;

    // Event Listeners
    const titleEl = this.element.querySelector('.page-title');
    titleEl.addEventListener('blur', () => {
        if (titleEl.innerText !== this.page.title) {
            this.onUpdate({ title: titleEl.innerText });
        }
    });

    this.element.querySelector('.page-icon').addEventListener('click', () => this.pickIcon());
    this.element.querySelector('.btn-add-icon').addEventListener('click', () => this.pickIcon());
    
    const changeCoverBtns = this.element.querySelectorAll('.btn-change-cover, .btn-add-cover');
    changeCoverBtns.forEach(btn => btn.addEventListener('click', () => this.pickCover()));
    
    this.element.querySelector('.btn-templates').addEventListener('click', () => this.showTemplates());

    const viewBtn = this.element.querySelector('.btn-view-opts');
    const viewMenu = this.element.querySelector('.view-menu');
    viewBtn.addEventListener('click', () => viewMenu.classList.toggle('hidden'));

    // Toggles (Apply to Editor Area - passed in? or find global?)
    // Ideally Main.js handles this, but we can emit events.
    this.element.querySelector('#toggle-full-width').addEventListener('change', (e) => {
        document.getElementById('editor-area').classList.toggle('full-width', e.target.checked);
    });
    this.element.querySelector('#toggle-small-text').addEventListener('change', (e) => {
         document.getElementById('editor-area').classList.toggle('small-text', e.target.checked);
    });
  }

  showTemplates() {
      // Lazy import to avoid circular dep if needed? No, just import service.
      // But we need a modal.
      // For simplicity, simple prompt or alert-based picker?
      // Better: Create a mini-modal or dropdown.
      // Text-based prompt for now:
      const tpl = prompt("Choose template: 1. Meeting Notes, 2. Daily Journal, 3. Project Plan", "1");
      let id = null;
      if (tpl === '1') id = 'meeting-notes';
      if (tpl === '2') id = 'daily-journal';
      if (tpl === '3') id = 'project-plan';
      
      if (id) {
          // Dispatch event or call service directly?
          // We need to reload the page to see blocks.
          // Better to dispatch to Main.js?
          // I will use CustomEvent again.
          this.element.dispatchEvent(new CustomEvent('apply-template', { bubbles: true, detail: { templateId: id } }));
      }
  }

  pickIcon() {
    const icons = ['📄', '📝', '✅', '📅', '🚀', '💡', '🎉', '🔒', '🏠', '💼'];
    const currentIdx = icons.indexOf(this.page.icon || '📄');
    const nextIcon = icons[(currentIdx + 1) % icons.length];
    this.onUpdate({ icon: nextIcon });
  }

  pickCover() {
    const covers = [
        'linear-gradient(90deg, #a8c0ff 0%, #3f2b96 100%)',
        'linear-gradient(90deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
        'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
        '#e0e0e0' // none
    ];
    const currentIdx = covers.indexOf(this.page.cover || covers[0]);
    const nextCover = covers[(currentIdx + 1) % covers.length];
    this.onUpdate({ cover: nextCover });
  }
}
