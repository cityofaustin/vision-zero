"use client";

import { useEffect } from "react";

/**
 * Custom hook that sets the document title for the page; e.g. "Crashes - Vision Zero Editor"
 */
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
