import Dexie from 'dexie';

export const db = new Dexie('MyLocalNotesDB');

db.version(1).stores({
  // Workspace ID is the partition key
  workspaces: 'id, name', 
  
  // Pages: hierarchy logic
  // [workspaceId+parent_id]: Compound index for fetching children of a page in a workspace
  // [workspaceId+id]: For fetching specific page
  pages: 'id, workspaceId, parent_id, [workspaceId+parent_id]',
  
  // Blocks: The content
  // [workspaceId+parent_id]: to get all blocks for a page/block
  blocks: 'id, workspaceId, parent_id, [workspaceId+parent_id]',

  // Databases (Schemas)
  databases: 'id, workspaceId'
});
