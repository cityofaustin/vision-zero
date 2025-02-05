/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "", // Set via env in production
  async redirects() {
    return [
      {
        source: "/",
        destination: "/crashes",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
