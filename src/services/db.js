import Dexie from 'dexie';

export const db = new Dexie('MyLocalNotesDB');

// Version 2: Add icons, covers, deleted_at
db.version(2).stores({
  workspaces: 'id, name',
  pages: 'id, workspaceId, parent_id, databaseId, icon, cover, deleted_at, [workspaceId+parent_id]',
  blocks: 'id, workspaceId, parent_id, [workspaceId+parent_id]',
  databases: 'id, workspaceId'
});

// Keep Version 1 for reference/migration if needed (Dexie handles auto-upgrade if only adding fields usually)
// db.version(1).stores({ ... });
