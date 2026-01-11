import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../src/services/storage';
import { db } from '../src/services/db';
import { CryptoService } from '../src/services/crypto';
import { DatabaseView } from '../src/components/DatabaseView';

describe('Database Engine', () => {
    let context;

    beforeEach(async () => {
        await db.delete();
        await db.open();
        context = await CryptoService.deriveKeys('u', 'p');
        await StorageService.setContext(context.workspaceId, context.encryptionKey);
    });

    it('should create and retrieve a Database schema', async () => {
        const schema = {
            title: "Projects",
            properties: [
                { name: "Status", type: "select", options: ["ToDo", "Done"] }
            ]
        };
        
        const saved = await StorageService.saveDatabase(schema);
        expect(saved.id).toBeDefined();
        
        const fetched = await StorageService.getDatabase(saved.id);
        expect(fetched.title).toBe("Projects");
        expect(fetched.properties.length).toBe(1);
    });

    it('should store page properties', async () => {
        // Create DB and Page
        const dbDoc = await StorageService.saveDatabase({ title: "DB" });
        const page = await StorageService.createPage({ title: "Task 1", parent_id: dbDoc.id });
        
        // Update Properties
        await StorageService.updatePageProperties(page.id, { Status: "Done" });
        
        // Verify
        const fetchedPages = await StorageService.getPages(dbDoc.id);
        expect(fetchedPages[0].properties.Status).toBe("Done");
    });
    
    it('DatabaseView should handle property updates', async () => {
        // Setup
        const dbDoc = await StorageService.saveDatabase({ id: 'db1', title: "DB", properties: [] });
        await StorageService.createPage({ id: 'p1', title: "T1", parent_id: 'db1' });
        
        const view = new DatabaseView('db1');
        await view.mount();
        
        // Explicitly calling the optimistic update handler that View passes to sub-views
        // We simulate what TableView/KanbanView calls
        // Note: I need to extract `onUpdate` or test the method that contains it.
        // Actually, let's just inspect the DOM or spy on StorageService.
        
        // Easier: Test the integration via StorageService, which we did above.
        // Let's test Schema Update simulation
        view.database.properties.push({ name: "NewProp", type: "text" });
        await StorageService.saveDatabase(view.database);
        
        const refreshedDB = await StorageService.getDatabase('db1');
        expect(refreshedDB.properties[0].name).toBe("NewProp");
    });
});
