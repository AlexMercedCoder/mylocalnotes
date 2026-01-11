export class TableView {
  constructor(database, pages, onUpdate) {
    this.database = database;
    this.pages = pages;
    this.onUpdate = onUpdate;
    this.element = document.createElement('div');
    this.element.className = 'table-view-container';
  }

  render() {
    this.element.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Header
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    
    // Title Column
    const thTitle = document.createElement('th');
    thTitle.textContent = "Name";
    trHead.appendChild(thTitle);

    // Property Columns
    this.database.properties.forEach(prop => {
      const th = document.createElement('th');
      th.textContent = prop.name;
      // Icon based on type?
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    this.pages.forEach(page => {
      const tr = document.createElement('tr');
      
      // Name Cell (Link)
      const tdName = document.createElement('td');
      const link = document.createElement('a');
      link.href = `#/page/${page.id}`;
      link.textContent = page.title || "Untitled";
      tdName.appendChild(link);
      tr.appendChild(tdName);

      // Property Cells
      this.database.properties.forEach(prop => {
        const td = document.createElement('td');
        const value = page.properties?.[prop.name] || "";
        
        if (prop.type === 'select') {
          // Select Input
          const select = document.createElement('select');
          const emptyOpt = document.createElement('option');
          emptyOpt.value = "";
          emptyOpt.textContent = "-";
          select.appendChild(emptyOpt);

          prop.options?.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if (opt === value) option.selected = true;
            select.appendChild(option);
          });
          
          select.onchange = (e) => this.onUpdate(page.id, prop.name, e.target.value);
          td.appendChild(select);
        } else {
          // Text Input (ContentEditable)
          td.contentEditable = true;
          td.textContent = value;
          td.onblur = (e) => {
            if (e.target.textContent !== value) {
                this.onUpdate(page.id, prop.name, e.target.textContent);
            }
          };
        }
        
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    this.element.appendChild(table);
  }
}
