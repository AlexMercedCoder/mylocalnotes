import { StorageService } from '../services/storage';
import { TableView } from './TableView';
import { KanbanView } from './KanbanView';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseView {
  constructor(databaseId) {
    this.databaseId = databaseId;
    this.element = document.createElement('div');
    this.element.className = 'database-view';
    this.viewType = 'table'; // table | kanban
    this.database = null;
    this.pages = [];
  }

  async mount() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    this.database = await StorageService.getDatabase(this.databaseId);
    this.pages = await StorageService.getPages(this.databaseId);
  }

  render() {
    this.element.innerHTML = '';
    
    if (!this.database) {
      this.element.innerHTML = '<div>Database not found</div>';
      return;
    }

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'database-toolbar';
    
    // Title
    const title = document.createElement('h2');
    title.textContent = this.database.title;
    toolbar.appendChild(title);

    // View Switcher
    const switchBtn = document.createElement('button');
    switchBtn.textContent = this.viewType === 'table' ? 'Switch to Kanban' : 'Switch to Table';
    switchBtn.onclick = () => {
      this.viewType = this.viewType === 'table' ? 'kanban' : 'table';
      this.render();
    };
    toolbar.appendChild(switchBtn);

    // Add Property (Simple prompt for now)
    const addPropBtn = document.createElement('button');
    addPropBtn.textContent = '+ Property';
    addPropBtn.onclick = async () => {
       const name = prompt("Property Name:");
       if (!name) return;
       const type = prompt("Type (text/select):", "text");
       
       let options = [];
       if (type === 'select') {
         const opts = prompt("Options (comma separated):", "To Do,In Progress,Done");
         options = opts.split(',').map(s => s.trim());
       }
       
       // Update Schema
       this.database.properties.push({ name, type, options });
       await StorageService.saveDatabase(this.database); 
       
       this.render(); 
    };
    toolbar.appendChild(addPropBtn);
    
    // New Row
    const addRowBtn = document.createElement('button');
    addRowBtn.textContent = '+ New Page';
    addRowBtn.onclick = async () => {
        await StorageService.createPage({
            title: "New Item",
            parent_id: this.databaseId
        });
        await this.loadData();
        this.render();
    };
    toolbar.appendChild(addRowBtn);

    this.element.appendChild(toolbar);

    // View Content
    const onUpdate = async (pageId, propName, value) => {
        // Optimistic update
        const page = this.pages.find(p => p.id === pageId);
        if (page) {
            if (!page.properties) page.properties = {};
            page.properties[propName] = value;
            await StorageService.updatePageProperties(pageId, page.properties);
            // Re-render needed for Kanban move? Yes.
            if (this.viewType === 'kanban') this.render();
        }
    };

    let viewComponent;
    if (this.viewType === 'table') {
        viewComponent = new TableView(this.database, this.pages, onUpdate);
    } else {
        viewComponent = new KanbanView(this.database, this.pages, onUpdate);
    }
    
    viewComponent.render();
    this.element.appendChild(viewComponent.element);
  }
}
