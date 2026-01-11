import Sortable from 'sortablejs';

export class KanbanView {
  constructor(database, pages, onUpdate) {
    this.database = database;
    this.pages = pages;
    this.onUpdate = onUpdate;
    this.element = document.createElement('div');
    this.element.className = 'kanban-board';
  }

  render() {
    this.element.innerHTML = '';
    
    // 1. Find the "Group By" property (First Select)
    const groupBy = this.database.properties.find(p => p.type === 'select');
    
    if (!groupBy) {
      this.element.innerHTML = '<div class="error">Kanban requires a "Select" property. Add one in Table View.</div>';
      return;
    }

    const columns = [...(groupBy.options || []), "Uncategorized"];

    columns.forEach(colName => {
      const colDiv = document.createElement('div');
      colDiv.className = 'kanban-column';
      colDiv.dataset.status = colName === "Uncategorized" ? "" : colName;
      
      const header = document.createElement('div');
      header.className = 'kanban-header';
      header.textContent = colName;
      colDiv.appendChild(header);

      const listDiv = document.createElement('div');
      listDiv.className = 'kanban-list';
      
      // Filter pages for this column
      const items = this.pages.filter(p => {
        const val = p.properties?.[groupBy.name];
        if (colName === "Uncategorized") return !val;
        return val === colName;
      });

      items.forEach(page => {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.dataset.id = page.id;
        card.textContent = page.title || "Untitled";
        card.onclick = () => window.location.hash = `#/page/${page.id}`;
        listDiv.appendChild(card);
      });

      colDiv.appendChild(listDiv);
      this.element.appendChild(colDiv);

      // Initialize Sortable
      new Sortable(listDiv, {
        group: 'kanban',
        animation: 150,
        onEnd: (evt) => {
           const itemEl = evt.item;
           const newStatus = evt.to.parentElement.dataset.status;
           const pageId = itemEl.dataset.id;
           
           // Trigger Update
           // Note: We don't manually move DOM back if update fails (optimistic)
           this.onUpdate(pageId, groupBy.name, newStatus);
        }
      });
    });
  }
}
