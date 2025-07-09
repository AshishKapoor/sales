import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default {
  eslint: {
    dirs: ["pages", "utils"],
    ignoreDuringBuilds: false,
    // Add ESLint ignore patterns
  },
  eslintIgnore: ["client/gen/**"],
  webpack: (config) => {
    config.plugins.push(new MiniCssExtractPlugin());
    return config;
  },
};
