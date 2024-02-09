import path from "path";
import { fileURLToPath } from "url";
import AutoImport from "unplugin-auto-import/webpack";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  webpack: (config, options) => {
    config.plugins.push(
      AutoImport({
        imports: ["react"],
        dirs: ["./src/hooks", "./src/lib"],
      }),
    );

    return config;
  },
};

export default nextConfig;
