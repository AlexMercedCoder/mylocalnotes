# Product Requirements Document (PRD): Client-Side Notion Clone

## 1. Introduction
This document outlines the requirements for a client-side, offline-first productivity application styled with Material Design. The application mimics the core functionality of Notion.so, providing users with a flexible workspace for notes, tasks, and project management without relying on a central server.

## 2. Goals & Vision
*   **Offline First**: Complete functionality without an internet connection.
*   **Privacy Focused**: All data lives in the user's browser (IndexedDB).
*   **High Customizability**: Material Design aesthetic with user-defined primary colors and automated Light/Dark modes.
*   **Structure**: Block-based editing and structured databases (Kanban, Tables).

## 3. Core Functionality

### 3.1. The Block Editor
*   **Text Blocks**: Paragraphs, Headings (H1, H2, H3), Bullet Lists, Numbered Lists, Quotes.
*   **Media**: Images (pasted or uploaded from local device - stored as blobs/base64 in IDB).
*   **Interactive Blocks**: Checkboxes (Todos), Toggles.
*   **Slash Menus**: Users can type `/` to trigger a menu to insert blocks.

### 3.2. Databases
*   **Structure**: Collections of pages with structured properties.
*   **Properties**:
    *   Text
    *   Number
    *   Select (Single option)
    *   Multi-select (Tags)
    *   Date
    *   Checkbox
*   **Views**:
    *   **Table View**: Spreadsheet-like interface. Resizable columns.
    *   **Kanban Board**: Drag-and-drop cards grouped by a `Select` property.

### 3.3. Organization (Sidebar)
*   **Nested Pages**: Infinite nesting of pages.
*   **Navigation Tree**: Collapsible sidebar showing the page hierarchy.
*   **Quick Add**: '+' button to add new top-level pages.

### 3.4. Data Management (Import/Export)
*   **JSON Backup**: Full system export to a JSON file (schema + content).
*   **JSON Restore**: Ability to wipe current state and replace with an imported JSON file.
*   **Markdown Export**: Convert a single page (and its children) to a `.md` file. Database rows become list items or tables.
*   **PDF Export**: Render the current page to a styled PDF designed for printing.

## 4. UI/UX & Design System
*   **Aesthetic**: Google Material Design 3 (Material You).
*   **Theming**:
    *   **Primary Color Picker**: User selects a HEX code.
    *   **Theme Engine**: Automatically generates tonal palettes (Primary, Secondary, Surface, Background, Error) based on the selection.
    *   **Mode**: Toggle between Light and Dark mode (persisted in LocalStorage).
*   **Responsiveness**: fully functional on Desktop and Tablet sizes.

## 5. Technical Constraints & Requirements
*   **Storage**: Must use `IndexedDB` for scalability (storing images and thousands of blocks). `LocalStorage` is restricted to preferences only.
*   **Zero Backend**: No remote API calls for data storage. All logic executes in the browser.
*   **Performance**: Editors must load instantly. Large databases must utilize virtualization if row counts exceed 50-100.
*   **Dependencies**: Minimize heavy dependencies. Use lightweight libraries where possible (`Dexie.js`, `SortableJS`).

## 6. User Flows
*   **Onboarding**: User opens app -> Sees "Getting Started" page -> Prompted to pick a theme color.
*   **Creating a Task Board**: User creates new Page -> Selects "Database" -> Chooses "Kanban" -> Adds "To Do", "Doing", "Done" columns -> Adds cards.
*   **Taking Notes**: User types -> Hits 'Enter' for new block -> Types `/heading` for sections -> Exports to PDF for sharing.
