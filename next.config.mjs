import path from "path";
import { fileURLToPath } from "url";
import AutoImport from "unplugin-auto-import/webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  webpack: (config, options) => {
    config.plugins.push(
      AutoImport({
        imports: ["react", "jotai", "jotai/utils", { react: ["Fragment"] }],
        defaultExportByFilename: true,
        dirs: ["./src/hooks", "./src/lib", "./src/atoms", "./src/components"],
      }),
    );

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
