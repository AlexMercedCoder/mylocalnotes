# Project Plan: Client-Side Notion Clone

## 1. Executive Summary
This project aims to build a high-fidelity, client-side-only clone of Notion.so. The application will run entirely in the browser, extracting the power of `IndexedDB` for storage and `LocalStorage` for preferences. It will feature a block-based editor, dynamic databases (Tables, Kanbans), and a customizable Material Design interface.

## 2. Technology Stack
*   **Core Framework**: Vanilla JavaScript with Vite (No heavy frontend frameworks like React/Vue/Angular to minimize overhead and strictly follow "Vanilla" preference, unless complexity demands a pivot, but we aim for lightweight).
*   **Build Tool**: Vite (`npx -y create-vite-app@latest ./`)
*   **Storage**: `Dexie.js` (Wrapper for IndexedDB) for bulk data (pages, blocks, databases). `LocalStorage` for user preferences (theme, last open page).
*   **Editor Engine**: `Editor.js` (Block-based editing) or a custom lightweight block implementation if Editor.js proves too rigid. *Decision: Start with Editor.js for rapid text/media block prototyping, but wrap it strictly.*
*   **Drag & Drop**: `SortableJS` (For Kanban boards and block rearranging).
*   **Export**: `html2pdf.js` (PDF) and custom JSON/Markdown serializers.
*   **CSS**: Vanilla CSS with CSS Variables for dynamic theming (Material Design 3 tokens).
*   **Icons**: Material Symbols (Google Fonts).

## 3. Architecture

### 3.1 Data Model (Schema)
The app will use a "Block" centric model stored in IndexedDB.

*   **`workspaces`**: `{ id, name, icon }`
*   **`blocks`**: The atomic unit.
    ```json
    {
      "id": "uuid",
      "type": "text" | "heading" | "image" | "todo" | "page" | "database_row",
      "content": { ... }, // Specific to type
      "properties": { ... }, // For database rows
      "parent_id": "uuid", // Pointer to parent page/block
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "children": ["uuid", "uuid"] // Ordered list of child block IDs
    }
    ```
*   **`databases`**: Definitions for structured collections.
    ```json
    {
      "id": "uuid",
      "title": "string",
      "parent_id": "uuid",
      "schema": {
        "status": { "type": "select", "options": [...] },
        "tags": { "type": "multi_select", "options": [...] }
      },
      "views": [
        { "id": "uuid", "type": "table" | "kanban", "config": { ... } }
      ]
    }
    ```

### 3.2 Application Structure
*   **`Store`**: A centralized state management class using the Observable pattern. It handles data fetching from Dexie and notifies UI components.
*   **`Router`**: A custom hash-based router to handle navigation between Pages (`#page/:id`) and Views.
*   **`Components`**: Functional components using template literals or `document.createElement`.
    *   `Sidebar`: Navigation tree.
    *   `BlockEditor`: The main writing surface.
    *   `DatabaseView`: Container for Table/Kanban renderers.
    *   `Toggles`: Theme switcher, Export modal.

## 4. Milestones & Implementation Phases

### Phase 1: Foundation & Storage Layer
*   Initialize Vite project.
*   Setup Clean Architecture folder structure.
*   Install `Dexie.js`, `uuid`.
*   Implement `StorageService` (CRUD for Blocks, Pages, Databases).
*   Set up the "Seed" data (Welcome page).

### Phase 2: Core UI & Routing
*   Implement the Application Shell (Sidebar + Main Content Area).
*   Set up Custom Router.
*   Implement CSS Variable theme engine (Primary Color generator).
*   Create Sidebar navigation tree builder (recursive implementation).

### Phase 3: The Block Editor
*   Integrate `Editor.js` or build Custom Block renderer.
*   Support basic types: Paragraph, Heading 1-3, Bullet List, Todo.
*   Implement 'Slash' command menu for adding blocks.
*   Ensure data persists to `Dexie` on every change (Auto-save).

### Phase 4: Database Engine (The Hard Part)
*   **Table View**:
    *   Create a grid layout.
    *   Implement cells that map to `properties` in the Block schema.
    *   Support adding/editing properties (Text, Select, Date).
*   **Kanban View**:
    *   Implement grouping logic (group by Select/Status property).
    *   Integrate `SortableJS` for dragging cards between columns.
    *   Update Block properties on drop.

### Phase 5: Advanced Features & Polish
*   **Dark/Light Mode**: Toggle affecting CSS variables.
*   **Import/Export**:
    *   JSON Import/Export (Dump DB).
    *   Markdown Export (Convert Block tree to MD).
    *   PDF Export (CSS Print media queries + `html2pdf`).
*   **Search**: Simple text search across all blocks in IndexedDB.

### Phase 6: Refinement
*   Optimize performance (virtual scrolling for large tables/lists).
*   Animations (View transitions).
*   Final QA (Cross-browser testing).

## 5. Development Guidelines
*   **Aesthetics**: Use MD3 Design tokens (Surface, OnSurface, PrimaryContainer, etc.).
*   **Code Style**: Modern ES6+ Modules. Async/Await for all DB operations. JSDoc for typing.
*   **Responsiveness**: Mobile-friendly sidebar (collapsible) and grid layouts.
