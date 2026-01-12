import './styles/main.scss';
import { appStore } from './store';
import { StorageService } from './services/storage';
import { Router } from './router';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { DocsService } from './services/docs';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Breadcrumbs } from './components/Breadcrumbs';
import { PageHeader } from './components/PageHeader';
import { TrashModal } from './components/TrashModal';

// Components
const sidebar = new Sidebar();
const themeToggle = ThemeToggle();
const shortcutsModal = new ShortcutsModal();
const breadcrumbs = new Breadcrumbs();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const editorArea = document.getElementById('editor-area');
const sidebarContainer = document.getElementById('sidebar');

// Mobile Toggle Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function toggleSidebar() {
    appScreen.classList.toggle('sidebar-open');
}

function closeSidebar() {
    appScreen.classList.remove('sidebar-open');
}

if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
if(sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// Auto-close sidebar on router navigation (mobile only check done solely via CSS visibility)
window.addEventListener('hashchange', closeSidebar);


// Add Theme Toggle & Shortcuts
document.body.appendChild(themeToggle);
document.body.appendChild(shortcutsModal.element);

// Trash Listener
window.addEventListener('open-trash', () => {
    const trash = new TrashModal(() => {
        document.body.removeChild(trash.element);
        sidebar.refresh();
    });
    document.body.appendChild(trash.element);
});

import { BlockEditor } from './components/BlockEditor';
import { TemplatesService } from './services/templates'; // Import Templates Logic

// ... (previous imports)

import { DatabaseView } from './components/DatabaseView'; // Import

// ...

// Setup Router
const router = new Router({
  '/': () => {
    editorArea.innerHTML = `
      <div class="empty-state">
        <h1>Welcome Back</h1>
        <p>Select a page from the sidebar to start writing.</p>
        <button id="create-db-btn">Create New Database</button>
      </div>`;
      
      // Hook up Create DB Button
      setTimeout(() => {
        const btn = document.getElementById('create-db-btn');
        if(btn) btn.onclick = async () => {
             const title = prompt("Database Name:");
             if(!title) return;
             // 1. Create Schema
             const dbDoc = await StorageService.saveDatabase({ title, properties: [] });
             // 2. Create Page Node (for Sidebar)
             await StorageService.createPage({ 
                title, 
                parent_id: "ROOT", // or current page 
                databaseId: dbDoc.id 
             });
             sidebar.refresh();
        };
      }, 0);
  },
  '/page/:id': async ({ id }) => {
    // Clear Area
    editorArea.innerHTML = '';
    
    const page = await StorageService.getPage(id);
    
    if (!page) {
        editorArea.innerHTML = 'Page not found';
        return;
    }

    if (page.databaseId) {
        // Render Database View
        const dbView = new DatabaseView(page.databaseId);
        editorArea.appendChild(dbView.element);
        await dbView.mount();
    } else {
        // Render Standard Page
        sidebar.setActive(id); // Highlight in Sidebar

        // 1. Breadcrumbs
        breadcrumbs.update(id);
        editorArea.appendChild(breadcrumbs.element);

        // 2. Page Header
        const header = new PageHeader(page, async (updates) => {
             // Optimistic Update
             Object.assign(page, updates);
             await StorageService.createPage(page);
             sidebar.refresh(); 
        });
        
        // Listen for Template Event
        header.element.addEventListener('apply-template', async (e) => {
             await TemplatesService.applyTemplate(page.id, e.detail.templateId);
             // Reload
             router.navigate(window.location.hash.slice(1)); 
             window.dispatchEvent(new Event('hashchange')); // Force reload
        });

        editorArea.appendChild(header.element);
        
        // 3. Editor
        const editor = new BlockEditor(id);
        editorArea.appendChild(editor.element);
        await editor.mount(); // Wait for editor to load data
    }
  }
});

// Pass router to sidebar so it can navigate
sidebar.router = router;

// Subscribe to Store
appStore.subscribe(async state => {
  if (state.isAuthenticated) {
    loginScreen.classList.add('hidden');
    loginScreen.classList.remove('active');
    appScreen.classList.remove('hidden');
    appScreen.classList.add('active');
    
    // Mount Sidebar
    sidebarContainer.innerHTML = '';
    sidebarContainer.appendChild(sidebar.element);
    
    // Seed Help Docs
    await DocsService.init();
    sidebar.refresh();

    // Start Router
    router.init();
  } else {
    loginScreen.classList.remove('hidden');
    loginScreen.classList.add('active');
    appScreen.classList.add('hidden');
    appScreen.classList.remove('active');
  }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;
  
  if (!username || !password) return;

  const btn = e.target.querySelector('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Deriving Keys...';
  btn.disabled = true;

  setTimeout(async () => {
    await appStore.login(username, password);
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 50);
});

