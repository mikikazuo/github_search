// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // GitHub APIからのアバター画像を許可
    domains: ["avatars.githubusercontent.com"],
  },
  // 環境変数を公開設定
  env: {
    // GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
};

module.exports = nextConfig;
