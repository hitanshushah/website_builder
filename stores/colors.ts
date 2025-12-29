import { defineStore } from 'pinia'
import type { Color } from '../app/types/index'

export interface SelectedColors {
  primary: string
  secondary: string
  background: string
  fourth?: string
}

export const useColorsStore = defineStore('colors', {
  state: () => ({
    selectedColorScheme: null as Color | null,
    defaultColorScheme: null as Color | null,
    selectedColors: {
      primary: '',
      secondary: '',
      background: '',
      fourth: ''
    } as SelectedColors,
    availableColors: [] as Color[]
  }),

  getters: {
    isColorSelected: (state) => !!state.selectedColorScheme,
    getSelectedColorScheme: (state) => state.selectedColorScheme,
    getDefaultColorScheme: (state) => state.defaultColorScheme,
    getSelectedColors: (state) => state.selectedColors,
    getAvailableColors: (state) => state.availableColors
  },

  actions: {
    setSelectedColorScheme(colorScheme: Color) {
      this.selectedColorScheme = colorScheme
      this.selectedColors = {
        primary: colorScheme.primary_color,
        secondary: colorScheme.secondary_color,
        background: colorScheme.background_color,
        fourth: colorScheme.fourth_color || ''
      }
    },

    setPrimaryColor(color: string) {
      this.selectedColors.primary = color
    },

    setSecondaryColor(color: string) {
      this.selectedColors.secondary = color
    },

    setBackgroundColor(color: string) {
      this.selectedColors.background = color
    },

    setFourthColor(color: string) {
      this.selectedColors.fourth = color
    },

    setAvailableColors(colors: Color[]) {
      this.availableColors = colors
      
      // Find and set default color scheme (first one with is_default = true)
      const defaultColor = colors.find(color => color.is_default === true)
      if (defaultColor) {
        this.defaultColorScheme = defaultColor
        
        // If no color is currently selected, set the default as selected
        if (!this.selectedColorScheme) {
          this.setSelectedColorScheme(defaultColor)
        }
      }
    },

    clearSelection() {
      // Restore to default color scheme instead of clearing
      if (this.defaultColorScheme) {
        this.setSelectedColorScheme(this.defaultColorScheme)
      } else {
        // Fallback: clear if no default exists
        this.selectedColorScheme = null
        this.selectedColors = {
          primary: '',
          secondary: '',
          background: '',
          fourth: ''
        }
      }
    }
  }
})
