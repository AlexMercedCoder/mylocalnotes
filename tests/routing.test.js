import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Router } from '../src/router';
import { Sidebar } from '../src/components/Sidebar';
import { StorageService } from '../src/services/storage';
import { appStore } from '../src/store';
import { db } from '../src/services/db';

describe('Routing & Sidebar', () => {
    let router;

    beforeEach(async () => {
        // Mock DB and Store
        await db.delete();
        await db.open();
        appStore.state = { isAuthenticated: true, workspaceId: 'mock-ws', username: 'user' };
        
        // Mock window.location.hash
        window.location.hash = '';
        
        // Setup Route Handlers
        const handlers = {
            '/': vi.fn(),
            '/page/:id': vi.fn()
        };
        
        router = new Router(handlers);
        router.init();
    });

    it('should match routes correctly', () => {
        const matchRoot = router.matchRoute('/', '/');
        expect(matchRoot).not.toBeNull();
        
        const matchPage = router.matchRoute('/page/:id', '/page/123-abc');
        expect(matchPage).toEqual({ id: '123-abc' });
    });

    it('should trigger handler on hash change', async () => {
        window.location.hash = '#/page/test-1';
        
        // Wait for event listener
        await new Promise(r => setTimeout(r, 50));
        
        expect(router.routes['/page/:id']).toHaveBeenCalled();
        const callArgs = router.routes['/page/:id'].mock.calls[0][0];
        expect(callArgs.id).toBe('test-1');
    });

    it('Sidebar should render pages', async () => {
        // Setup Context
        const { workspaceId, encryptionKey } = await import('../src/services/crypto').then(m => m.CryptoService.deriveKeys('u', 'p'));
        await StorageService.setContext(workspaceId, encryptionKey);
        
        // Create a page
        await StorageService.createPage({ id: 'p1', title: 'Page One', parent_id: "ROOT" });
        
        const sidebar = new Sidebar(router);
        await sidebar.refresh();
        
        const html = sidebar.element.innerHTML;
        expect(html).toContain('Page One');
    });
});
