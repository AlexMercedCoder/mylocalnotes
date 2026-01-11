import { StorageService } from '../services/storage';

export class Breadcrumbs {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'breadcrumbs';
  }

  async update(pageId) {
    this.element.innerHTML = ''; // Clear
    
    if (!pageId) return;

    const path = await StorageService.getPagePath(pageId);
    
    if (path.length === 0) return;

    path.forEach((item, index) => {
        const isLast = index === path.length - 1;
        
        const span = document.createElement('span');
        span.className = 'breadcrumb-item';
        
        if (isLast) {
            span.textContent = item.title;
            span.classList.add('active');
        } else {
            const link = document.createElement('a');
            link.textContent = item.title;
            link.href = `#/page/${item.id}`;
            span.appendChild(link);
            
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '/';
            span.appendChild(separator);
        }
        
        this.element.appendChild(span);
    });
  }
}
