import { defineStore } from 'pinia'
import type { Template } from '../app/types/index'

export const useTemplatesStore = defineStore('templates', {
  state: () => ({
    selectedTemplate: null as Template | null,
    defaultTemplate: null as Template | null,
    availableTemplates: [] as Template[]
  }),

  getters: {
    isTemplateSelected: (state) => !!state.selectedTemplate,
    getSelectedTemplate: (state) => state.selectedTemplate,
    getDefaultTemplate: (state) => state.defaultTemplate,
    getAvailableTemplates: (state) => state.availableTemplates
  },

  actions: {
    setSelectedTemplate(template: Template) {
      this.selectedTemplate = template
    },

    setAvailableTemplates(templates: Template[]) {
      this.availableTemplates = templates
      
      // Find and set default template (first one with is_default = true)
      const defaultTemplate = templates.find(template => template.is_default === true)
      if (defaultTemplate) {
        this.defaultTemplate = defaultTemplate
        
        // If no template is currently selected, set the default as selected
        if (!this.selectedTemplate) {
          this.setSelectedTemplate(defaultTemplate)
        }
      }
    },

    clearSelection() {
      // Restore to default template instead of clearing
      if (this.defaultTemplate) {
        this.setSelectedTemplate(this.defaultTemplate)
      } else {
        // Fallback: clear if no default exists
        this.selectedTemplate = null
      }
    }
  }
})

