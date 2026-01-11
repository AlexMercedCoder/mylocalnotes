import { StorageService } from '../services/storage';
import { appStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { ExportService } from '../services/export';
import { SearchModal } from './SearchModal';

export class Sidebar {
  constructor(router) {
    this.router = router;
    this.searchModal = new SearchModal(router);
    document.body.appendChild(this.searchModal.element); // Mount global modal
    
    this.element = document.createElement('nav');
    this.element.id = 'sidebar-content';
    this.currentWorkspace = null;
    
    // Re-render when store updates (e.g. login)
    appStore.subscribe(state => {
      if (state.isAuthenticated && state.workspaceId !== this.currentWorkspace) {
        this.currentWorkspace = state.workspaceId;
        this.refresh();
      }
    });

    // We also need to refresh when Pages change (added/removed)
    // For now, we'll manually call refresh after actions, or implement an event bus later.
  }

  async refresh() {
    this.element.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
      const rootPages = await StorageService.getPages("ROOT");
      this.element.innerHTML = ''; // clear loading
      
      const header = document.createElement('div');
      header.className = 'sidebar-header';
      header.innerHTML = `<h3>My Notes</h3>`;
      
      const actions = document.createElement('div');
      actions.style.display = 'flex';
      
      const searchBtn = document.createElement('button');
      searchBtn.className = 'btn-icon-sm';
      searchBtn.innerHTML = '<span class="material-symbols-outlined">search</span>';
      searchBtn.title = "Search (Cmd+K)";
      searchBtn.onclick = () => this.searchModal.open();
      actions.appendChild(searchBtn);

      const addBtn = document.createElement('button');
      addBtn.className = 'btn-icon-sm';
      addBtn.innerHTML = '<span class="material-symbols-outlined">add</span>';
      addBtn.title = "New Page";
      addBtn.onclick = () => this.createPage("ROOT");
      actions.appendChild(addBtn);

      header.appendChild(actions);
      
      this.element.appendChild(header);

      // Page Tree
      const tree = document.createElement('ul');
      tree.className = 'page-tree';
      
      for (const page of rootPages) {
        tree.appendChild(await this.renderItem(page));
      }
      this.element.appendChild(tree);
      
    } catch (e) {
      console.error(e);
      this.element.innerHTML = '<div class="error">Failed to load sidebar</div>';
    }
  }

  async renderItem(page) {
    const li = document.createElement('li');
    li.className = 'page-item';
    li.dataset.id = page.id;

    // Row Content (Toggle + Title + Actions)
    const row = document.createElement('div');
    row.className = 'page-row';
    
    // Toggle (Expand/Collapse)
    // Check if has children to decide if we show arrow
    const children = await StorageService.getPages(page.id);
    const hasChildren = children.length > 0;
    
    const toggle = document.createElement('span');
    toggle.className = `toggle-icon material-symbols-outlined ${hasChildren ? 'has-children' : ''}`;
    toggle.textContent = 'arrow_right'; 
    toggle.onclick = (e) => {
      e.stopPropagation();
      li.classList.toggle('expanded');
      toggle.textContent = li.classList.contains('expanded') ? 'arrow_drop_down' : 'arrow_right';
    };
    row.appendChild(toggle);

    // Title / Link
    const link = document.createElement('span');
    link.className = 'page-link';
    link.textContent = page.title || "Untitled";
    link.onclick = () => this.router.navigateTo(`/page/${page.id}`);
    row.appendChild(link);

    // Quick Add Child
    const addSub = document.createElement('span');
    addSub.className = 'action-icon material-symbols-outlined';
    addSub.textContent = 'add';
    addSub.title = "Add sub-page";
    addSub.onclick = (e) => {
      e.stopPropagation();
      this.createPage(page.id);
      li.classList.add('expanded'); // Auto expand
    };
    row.appendChild(addSub);
    
    // Export Icon
    const exportBtn = document.createElement('span');
    exportBtn.className = 'action-icon material-symbols-outlined';
    exportBtn.textContent = 'download';
    exportBtn.title = "Export Markdown";
    exportBtn.onclick = async (e) => {
      e.stopPropagation();
      try {
        const md = await ExportService.generateMarkdown(page.id);
        ExportService.downloadFile(`${page.title || 'untitled'}.md`, md);
      } catch(err) {
        alert("Export failed");
        console.error(err);
      }
    };
    row.appendChild(exportBtn);

    li.appendChild(row);

    // Children Container
    if (hasChildren) {
      const childUl = document.createElement('ul');
      childUl.className = 'page-children';
      for (const child of children) {
        childUl.appendChild(await this.renderItem(child));
      }
      li.appendChild(childUl);
    } else {
      // Placeholder for future children to append to
      const childUl = document.createElement('ul');
      childUl.className = 'page-children';
      li.appendChild(childUl);
    }

    return li;
  }

  async createPage(parentId) {
    const newPage = await StorageService.createPage({
      id: uuidv4(),
      title: "Untitled",
      parent_id: parentId
    });
    // Optimistic UI update or full refresh?
    // Full refresh is safer for consistency for now.
    await this.refresh();
    
    this.router.navigateTo(`/page/${newPage.id}`);
  }
}
