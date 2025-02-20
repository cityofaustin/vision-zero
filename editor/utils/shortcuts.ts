import { useCallback, useLayoutEffect, useRef, useEffect } from "react";

/**
 * Custom hook for adding keyboard shortcuts
 */
export const useKeyboardShortcut = (
  // Array of keys that should trigger the callback
  keys: string[],
  // Callback that handles what should happen when the keys are pressed
  callback: (event: KeyboardEvent) => void
) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (keys.some((key) => event.shiftKey === true && event.key === key)) {
        callbackRef.current(event);
      }
    },
    [keys]
  );
  useEffect(() => {
    if (document) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [handleKeyPress]);
};
