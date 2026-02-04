import withRspack from "next-rspack";
import type { NextConfig } from "next";

import path from "path";
import { fileURLToPath } from "url";
import AutoImport from "unplugin-auto-import/rspack";

const __filename = fileURLToPath(import.meta.url);

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "export",
  sassOptions: {
    includePaths: [path.join(path.dirname(__filename), "styles")],
  },
  webpack: (config) => {
    config.plugins.push(
      AutoImport({
        imports: [
          "react",
          { react: ["Fragment"] },
          {
            "@preact/signals-react": [
              "signal",
              "computed",
              "useSignal",
              "useComputed",
              "useSignalEffect",
            ],
          },
          { "@preact/signals-react/runtime": ["useSignals"] },
          { "@preact/signals-react/utils": ["Show", "For"] },
        ],
        defaultExportByFilename: true,
        dirs: ["./src/hooks", "./src/lib", "./src/stores", "./src/components"],
      }),
    );

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
};

export default withRspack(nextConfig);
