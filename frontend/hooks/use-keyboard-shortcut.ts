import { useEffect } from "react";

interface ShortcutOptions {
  key: string;
  metaOrCtrl?: boolean;
  onTrigger: () => void;
  enabled?: boolean;
}

/** Registers a single global keyboard shortcut for the lifetime of the component. */
export function useKeyboardShortcut({ key, metaOrCtrl = false, onTrigger, enabled = true }: ShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      const modifierMatches = metaOrCtrl ? e.metaKey || e.ctrlKey : true;
      if (e.key.toLowerCase() === key.toLowerCase() && modifierMatches) {
        e.preventDefault();
        onTrigger();
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, metaOrCtrl, onTrigger, enabled]);
}
