import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  optimization: {
    splitChunks: false,
  },
};

module.exports = {
  // ...
  optimization: {
    splitChunks: false,
  },
  // ...
};

export default nextConfig;
