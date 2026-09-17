import { useEffect } from "react";

const SCRIPT_URL = "https://umami.austinmobility.io/script.js";

// Fixed ID for the <script> tag in the DOM. Used to avoid injecting the tracker twice
const SCRIPT_ELEMENT_ID = "umami-analytics";

/**
 * Umami Analytics is loaded when VITE_UMAMI_WEBSITE_ID is set.
 * See @viewer/README.md for details.
 */
const UmamiAnalytics = () => {
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const domains = import.meta.env.VITE_UMAMI_DOMAINS;
  const tag = import.meta.env.VITE_UMAMI_TAG;

  useEffect(() => {
    if (!websiteId) {
      return;
    }

    // Avoid injecting the tracker twice
    if (document.getElementById(SCRIPT_ELEMENT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ELEMENT_ID;
    script.defer = true;
    script.src = SCRIPT_URL;
    script.setAttribute("data-website-id", websiteId);

    if (domains) {
      script.setAttribute("data-domains", domains);
    }

    if (tag) {
      script.setAttribute("data-tag", tag);
    }

    document.head.appendChild(script);
  }, [websiteId, domains, tag]);

  return null;
};

export default UmamiAnalytics;
