import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const {
          key,
          ctrlKey = false,
          metaKey = false,
          shiftKey = false,
          altKey = false,
          callback
        } = shortcut

        const keyMatches = event.key.toLowerCase() === key.toLowerCase()
        const ctrlMatches = event.ctrlKey === ctrlKey
        const metaMatches = event.metaKey === metaKey
        const shiftMatches = event.shiftKey === shiftKey
        const altMatches = event.altKey === altKey

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault()
          callback()
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Common shortcuts for the app
export const commonShortcuts = {
  newChat: { key: 'n', ctrlKey: true, description: 'New chat' },
  clearChat: { key: 'k', ctrlKey: true, description: 'Clear chat' },
  toggleTheme: { key: 'd', ctrlKey: true, description: 'Toggle theme' },
  focusInput: { key: '/', description: 'Focus input' },
  settings: { key: ',', ctrlKey: true, description: 'Open settings' }
}