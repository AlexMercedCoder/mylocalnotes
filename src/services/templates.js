import { StorageService } from './storage';
import { v4 as uuidv4 } from 'uuid';

export const TemplatesService = {
  getTemplates() {
    return [
      {
        id: 'meeting-notes',
        name: '📅 Meeting Notes',
        description: 'Capture agenda, attendees, and action items.',
        blocks: [
            { type: 'header', content: { text: "Meeting Notes", level: 1 } },
            { type: 'paragraph', content: { text: "Date: " + new Date().toLocaleDateString() } },
            { type: 'header', content: { text: "Attendees", level: 3 } },
            { type: 'checklist', content: { items: [{text: "Person A", checked: false}, {text: "Person B", checked: false}] } },
            { type: 'header', content: { text: "Agenda", level: 2 } },
            { type: 'list', content: { style: 'unordered', items: ['Topic 1', 'Topic 2'] } },
            { type: 'header', content: { text: "Action Items", level: 2 } },
            { type: 'checklist', content: { items: [{text: "Task 1", checked: false}] } }
        ]
      },
      {
        id: 'daily-journal',
        name: '📔 Daily Journal',
        description: 'Reflect on your day.',
        blocks: [
             { type: 'header', content: { text: "Daily Journal", level: 1 } },
             { type: 'quote', content: { text: "What is the highlight of today?", caption: "Reflection" } },
             { type: 'header', content: { text: "Gratitude", level: 3 } },
             { type: 'list', content: { style: 'unordered', items: ['I am grateful for...', '...'] } },
             { type: 'header', content: { text: "Notes", level: 3 } },
             { type: 'paragraph', content: { text: "..." } }
        ]
      },
      {
        id: 'project-plan',
        name: '🚀 Project Plan',
        description: 'Define goals and tasks.',
        blocks: [
            { type: 'header', content: { text: "Project Name", level: 1 } },
            { type: 'warning', content: { title: "Goal", message: "Define the primary objective." } },
            { type: 'header', content: { text: "Milestones", level: 2 } },
            { type: 'list', content: { style: 'ordered', items: ['Phase 1', 'Phase 2', 'Launch'] } }
        ]
      }
    ];
  },

  async applyTemplate(pageId, templateId) {
    const template = this.getTemplates().find(t => t.id === templateId);
    if (!template) return;

    for (const b of template.blocks) {
        await StorageService.saveBlock({
            id: uuidv4(),
            parent_id: pageId,
            type: b.type,
            content: b.content,
            workspaceId: StorageService.getContext().workspaceId
        });
    }
  }
};
