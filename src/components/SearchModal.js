import { SearchService } from '../services/search';

export class SearchModal {
  constructor(router) {
    this.router = router;
    this.element = document.createElement('div');
    this.element.className = 'search-modal-overlay hidden';
    this.element.innerHTML = `
      <div class="search-modal">
        <input type="text" placeholder="Search pages..." id="search-input" />
        <ul class="search-results" id="search-results"></ul>
        <div class="search-footer">
            <small>Press ESC to close</small>
        </div>
      </div>
    `;
    
    this.input = this.element.querySelector('input');
    this.resultsList = this.element.querySelector('ul');
    
    // Event Listeners
    this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    this.element.addEventListener('click', (e) => {
        if (e.target === this.element) this.close();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.element.classList.contains('hidden')) {
            this.close();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            this.open();
        }
    });
  }

  open() {
    this.element.classList.remove('hidden');
    this.input.value = '';
    this.resultsList.innerHTML = '';
    setTimeout(() => this.input.focus(), 50);
  }

  close() {
    this.element.classList.add('hidden');
  }

  async handleSearch(query) {
    if (!query) {
        this.resultsList.innerHTML = '';
        return;
    }
    
    const results = await SearchService.search(query);
    this.renderResults(results);
  }

  renderResults({ pages, blocks }) {
    this.resultsList.innerHTML = '';
    
    // Page Matches
    pages.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="material-symbols-outlined">description</span> ${p.title}`;
        li.onclick = () => {
            this.router.navigateTo(`/page/${p.id}`);
            this.close();
        };
        this.resultsList.appendChild(li);
    });

    // Block Matches
    blocks.forEach(b => {
        const li = document.createElement('li');
        const preview = b.content.text ? b.content.text.substring(0, 50) + '...' : 'Block Match';
        li.innerHTML = `<span class="material-symbols-outlined">notes</span> <small>${preview}</small>`;
        li.onclick = () => {
            this.router.navigateTo(`/page/${b.parent_id}`); // Navigate to parent page
            this.close();
        };
        this.resultsList.appendChild(li);
    });
    
    if (pages.length === 0 && blocks.length === 0) {
        this.resultsList.innerHTML = '<li class="no-results">No results found</li>';
    }
  }
}
