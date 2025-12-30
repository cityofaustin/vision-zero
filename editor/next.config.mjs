/**
 * the base path value is expected to be set to /editor in staging and prod
 * and undefined locally
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: BASE_PATH,
  eslint: {
    dirs: [
      "app",
      "components",
      "configs",
      "contexts",
      "queries",
      "schema",
      "types",
      "utils",
    ],
    ignoreDuringBuilds: false,
  },
  async redirects() {
    return [
      // handle when client navigates to the root
      // if `basePath` is defined, root is inferred
      // from the basePath
      {
        source: "/",
        destination: `/crashes`,
        permanent: false,
      },
      // handle when client navigates to the actual root,
      // regardless of if there is a basepath
      {
        source: "/",
        destination: `${BASE_PATH}/crashes`,
        permanent: false,
        basePath: false,
      },
    ];
  },
  sassOptions: {
    silenceDeprecations: [
      "mixed-decls",
      "color-functions",
      "global-builtin",
      "import",
      "legacy-js-api",
    ],
  },
};

export default nextConfig;
