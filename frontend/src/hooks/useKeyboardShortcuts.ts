import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export interface KeyboardShortcutsConfig {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const { shortcuts, enabled = true } = config;
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const pressedKey = event.key.toLowerCase();
    const isCtrl = event.ctrlKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;
    const isMeta = event.metaKey;

    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === pressedKey;
      const ctrlMatch = shortcut.ctrl === isCtrl;
      const shiftMatch = shortcut.shift === isShift;
      const altMatch = shortcut.alt === isAlt;
      const metaMatch = shortcut.meta === isMeta;

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchingShortcut.action();
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);

  return {
    enabled,
    shortcuts: shortcutsRef.current
  };
};

// Common keyboard shortcuts for resume builder
export const RESUME_BUILDER_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 's',
    ctrl: true,
    action: () => {
      // Trigger save action
      const saveEvent = new CustomEvent('resume-save');
      document.dispatchEvent(saveEvent);
    },
    description: 'Save resume'
  },
  {
    key: 'z',
    ctrl: true,
    action: () => {
      // Trigger undo action
      const undoEvent = new CustomEvent('resume-undo');
      document.dispatchEvent(undoEvent);
    },
    description: 'Undo last action'
  },
  {
    key: 'y',
    ctrl: true,
    action: () => {
      // Trigger redo action
      const redoEvent = new CustomEvent('resume-redo');
      document.dispatchEvent(redoEvent);
    },
    description: 'Redo last action'
  },
  {
    key: 'p',
    ctrl: true,
    action: () => {
      // Trigger print/export action
      const printEvent = new CustomEvent('resume-print');
      document.dispatchEvent(printEvent);
    },
    description: 'Print/Export resume'
  },
  {
    key: '1',
    ctrl: true,
    action: () => {
      // Navigate to personal info section
      const navEvent = new CustomEvent('resume-navigate', { detail: 'personal' });
      document.dispatchEvent(navEvent);
    },
    description: 'Go to Personal Info'
  },
  {
    key: '2',
    ctrl: true,
    action: () => {
      // Navigate to experience section
      const navEvent = new CustomEvent('resume-navigate', { detail: 'experience' });
      document.dispatchEvent(navEvent);
    },
    description: 'Go to Experience'
  },
  {
    key: '3',
    ctrl: true,
    action: () => {
      // Navigate to education section
      const navEvent = new CustomEvent('resume-navigate', { detail: 'education' });
      document.dispatchEvent(navEvent);
    },
    description: 'Go to Education'
  },
  {
    key: '4',
    ctrl: true,
    action: () => {
      // Navigate to skills section
      const navEvent = new CustomEvent('resume-navigate', { detail: 'skills' });
      document.dispatchEvent(navEvent);
    },
    description: 'Go to Skills'
  },
  {
    key: '?',
    action: () => {
      // Show keyboard shortcuts help
      const helpEvent = new CustomEvent('show-keyboard-help');
      document.dispatchEvent(helpEvent);
    },
    description: 'Show keyboard shortcuts'
  },
  {
    key: 'Escape',
    action: () => {
      // Close modals or clear selection
      const escapeEvent = new CustomEvent('escape-pressed');
      document.dispatchEvent(escapeEvent);
    },
    description: 'Close modal or clear selection'
  },
  {
    key: 'c',
    ctrl: true,
    action: () => {
      // Toggle collaboration panel
      const collaborationEvent = new CustomEvent('toggle-collaboration');
      document.dispatchEvent(collaborationEvent);
    },
    description: 'Toggle collaboration panel'
  },
  {
    key: '4',
    ctrl: true,
    action: () => {
      // Navigate to skills section
      const navEvent = new CustomEvent('resume-navigate', { detail: 'skills' });
      document.dispatchEvent(navEvent);
    },
    description: 'Go to Skills'
  },
  {
    key: '5',
    ctrl: true,
    action: () => {
      // Navigate to projects section
      const navEvent = new CustomEvent('resume-navigate', { detail: 'projects' });
      document.dispatchEvent(navEvent);
    },
    description: 'Go to Projects'
  }
];

// Hook for listening to custom events
export const useCustomEvent = (eventName: string, handler: (event: CustomEvent) => void) => {
  useEffect(() => {
    const eventHandler = (event: Event) => {
      handler(event as CustomEvent);
    };

    document.addEventListener(eventName, eventHandler);
    return () => {
      document.removeEventListener(eventName, eventHandler);
    };
  }, [eventName, handler]);
};
