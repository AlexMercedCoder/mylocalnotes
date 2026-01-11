import './styles/main.scss';
import { appStore } from './store';
import { StorageService } from './services/storage';
import { Router } from './router';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';

// Components
const sidebar = new Sidebar();
const themeToggle = ThemeToggle();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const editorArea = document.getElementById('editor-area');
const sidebarContainer = document.getElementById('sidebar');

// Add Theme Toggle
document.body.appendChild(themeToggle);

import { BlockEditor } from './components/BlockEditor';

// ... (previous imports)

import { BlockEditor } from './components/BlockEditor';
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
        const titleEl = document.createElement('h1');
        titleEl.contentEditable = true;
        titleEl.className = 'page-title';
        titleEl.innerText = page.title;
        titleEl.onblur = async () => {
             await StorageService.createPage({ ...page, title: titleEl.innerText });
             sidebar.refresh(); 
        };
        editorArea.appendChild(titleEl);
        
        const editor = new BlockEditor(id);
        editorArea.appendChild(editor.element);
        await editor.mount();
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

