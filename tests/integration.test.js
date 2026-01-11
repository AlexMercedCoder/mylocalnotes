import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { appStore } from '../src/store';
import { StorageService } from '../src/services/storage';
import { db } from '../src/services/db';
import '../src/styles/main.scss'; // Ensure styles load if relevant (mostly for vite transform)

// We need to mocking the actual HTML structure since JSDOM starts empty
const htmlTemplate = `
    <div id="login-screen" class="screen active">
      <form id="login-form">
        <input type="text" id="username" value="testuser" />
        <input type="password" id="password" value="pass123" />
        <button type="submit">Unlock</button>
      </form>
    </div>
    <div id="app" class="screen hidden">
        <main id="editor-area"></main>
    </div>
`;

describe('Integration: Login Flow', () => {
    beforeEach(async () => {
        document.body.innerHTML = htmlTemplate;
        await db.delete();
        await db.open();
        
        // Reset Store
        appStore.state = { 
            isAuthenticated: false, 
            username: null, 
            workspaceId: null, 
            currentError: null 
        };
        appStore.listeners.clear();
    });

    it('should switch screens and load dashboard after successful login', async () => {
        // 1. Setup UI Logic (Simulating parts of main.js)
        const loginScreen = document.getElementById('login-screen');
        const appScreen = document.getElementById('app');
        const editorArea = document.getElementById('editor-area');
        
        // Wire up listener manually for the test (mimicking main.js)
        appStore.subscribe(async (state) => {
            if (state.isAuthenticated) {
                loginScreen.classList.add('hidden');
                appScreen.classList.remove('hidden');
                
                // Simulate main.js loadDashboard
                const pages = await StorageService.getPages("ROOT");
                editorArea.innerHTML = `<h1>Welcome back, ${state.username}</h1><ul>${pages.map(p => `<li>${p.title}</li>`).join('')}</ul>`;
            }
        });

        // 2. Perform Login action
        const success = await appStore.login('testuser', 'pass123');
        expect(success).toBe(true);
        
        // 3. Wait for microtasks (store notification and inner async calls)
        await new Promise(resolve => setTimeout(resolve, 100));

        // 4. Assert UI State
        expect(loginScreen.classList.contains('hidden')).toBe(true);
        expect(appScreen.classList.contains('hidden')).toBe(false);
        expect(editorArea.innerHTML).toContain('Welcome back, testuser');
        expect(editorArea.innerHTML).toContain('Welcome to My Local Notes');
    });
});
