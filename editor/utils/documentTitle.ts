// hooks/useDocumentTitle.js
"use client";

import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    // Cleanup function to restore original title if needed
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
