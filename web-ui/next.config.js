import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default {
  eslint: {
    dirs: ["pages", "utils"],
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    config.plugins.push(new MiniCssExtractPlugin());
    return config;
  },
};
