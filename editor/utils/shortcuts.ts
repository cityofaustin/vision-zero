import { useCallback, useLayoutEffect, useRef, useEffect } from "react";
import { ShortcutKeyLookup } from "@/types/keyboardShortcuts";

/**
 * Custom hook for adding keyboard shortcuts.
 *
 * The shift key must be used in conjunction with the array of keys passed
 * and the focused element can't be an input or text area
 * in order to fire the handleKeyPress callback.
 */
export const useKeyboardShortcut = (
  // Array of keys that should trigger the callback when used alongside the shift key
  shortcutKeyLookup: ShortcutKeyLookup[],
  // Callback that handles what happens when the keys are pressed
  callback: (
    event: KeyboardEvent,
    shortcutKeyLookup: ShortcutKeyLookup[]
  ) => void
) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const targetsToDisable = ["INPUT", "TEXTAREA", "SELECT"];
      const shortcutKeys = shortcutKeyLookup.map((shortcut) => shortcut.key);
      // Type guard to access tagName property, see https://iifx.dev/en/articles/156175355
      if (event.target instanceof Element) {
        // Don't trigger callback if focused element is an input or textarea
        if (targetsToDisable.includes(event.target.tagName)) {
          return;
        }
        // Check if key in shortcutKeys array and used in conjunction with shift key
        if (
          shortcutKeys.some(
            (key) =>
              event.shiftKey === true &&
              event.key.toUpperCase() === key.toUpperCase()
          )
        ) {
          callbackRef.current(event, shortcutKeyLookup);
        }
      }
    },
    [shortcutKeyLookup]
  );
  useEffect(() => {
    if (document) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [handleKeyPress]);
};

// Handles scrolling down to element on key press
export const scrollToElementOnKeyPress = (
  event: KeyboardEvent,
  shortcutKeyLookup: ShortcutKeyLookup[]
) => {
  const eventKey = event.key.toUpperCase();
  const elementId =
    shortcutKeyLookup &&
    shortcutKeyLookup.find((shortcut) => eventKey === shortcut.key)?.elementId;
  const element = document.getElementById(String(elementId));
  element?.scrollIntoView({ behavior: "instant" });
};
