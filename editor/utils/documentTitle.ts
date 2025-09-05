"use client";

import { useEffect } from "react";

/**
 * Custom hook that sets the document title for the page
 */
export const useDocumentTitle = (
  title: string,
  excludeSuffix: boolean = false
) => {
  const suffix = excludeSuffix ? "" : " - Vision Zero Editor";
  useEffect(() => {
    document.title = title + suffix;
  }, [title, suffix]);
};
