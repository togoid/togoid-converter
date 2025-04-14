import withRspack from "next-rspack";
import type { NextConfig } from "next";

import path from "path";
import { fileURLToPath } from "url";
import AutoImport from "unplugin-auto-import/rspack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "export",
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  webpack: (config) => {
    config.plugins.push(
      AutoImport({
        imports: [
          "react",
          "jotai",
          "jotai/utils",
          { react: ["Fragment"] },
          {
            "@preact/signals-react": [
              "signal",
              "useSignal",
              "useComputed",
              "useSignalEffect",
            ],
          },
          { "@preact/signals-react/runtime": ["useSignals"] },
        ],
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
  trailingSlash: true,
};

export default withRspack(nextConfig);
