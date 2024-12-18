/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
