/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jedrazb/querybox", "@jedrazb/querybox-shared"],
};

module.exports = nextConfig;
