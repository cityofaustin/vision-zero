#!/usr/bin/env bash

#
# The following script patches the header html for the index.html page
# based on provided environment variables.
#

# If we do have it, then make assumptions about the environment.
if [[ "${VZV_ENVIRONMENT}" = "PRODUCTION" ]]; then
  # Assume production env
  export vzv_snippet_mode="production";
else
  # Assume staging
  export vzv_snippet_mode="staging";
fi;


# If we have the environment, let's check for the snippet comment:
if grep -q "<\!--VZV_HEADER_SNIPPETS-->" public/index.html; then
  # We have all we need!
  echo "Patch code available!";
else
  # We don't have it, let's exit completely.
  echo "Patch code unavailable, please add '<!--VZV_HEADER_SNIPPETS-->' to the header."
  exit 0;
fi;

# Log current environment
echo "Patching snippets for environment: ${vzv_snippet_mode}";

# Trusting AWK as opposed to SED because it works in both mac and linux as you would expect.
# SED in mac for some reason wants me to install gsed which I can't tell if it is available in Netlify.
awk 'NR==FNR { a[n++]=$0; next } /VZV_HEADER_SNIPPETS/ { for (i=0;i<n;++i) print a[i]; next } 1' \
      "public/header_snippets_${vzv_snippet_mode}.html" \
      ./public/index.html > ./public/index.patched.html;

# Finally we swap file names and clean up...
mv ./public/index.html ./public/index.backup.html;
mv ./public/index.patched.html ./public/index.html;
