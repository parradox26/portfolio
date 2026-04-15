import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // satellite.js WASM build does `await import("node:module")` and
      // `import("node:worker_threads")` inside an ENVIRONMENT_IS_NODE guard.
      // Those branches never run in the browser, but webpack's static analysis
      // still tries to bundle them and fails on the unrecognised "node:" scheme.
      //
      // 1. Strip the "node:" prefix so the resolver can handle the bare name.
      // 2. Redirect the bare names to an empty shim (the code is dead at runtime).
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );

      const emptyShim = path.resolve("src/lib/empty-node-module.js");
      config.resolve.fallback = {
        ...config.resolve.fallback,
        module: emptyShim,
        worker_threads: emptyShim,
        fs: emptyShim,
        path: emptyShim,
        url: emptyShim,
      };

      // The satellite.js pthreads WASM runtime (em-pthread) creates a circular
      // chunk dependency that webpack can't hash. It's a Node.js-only worker
      // runtime — never used in the browser. Alias it to the empty shim so
      // webpack excludes the entire pthreads chunk from the client bundle.
      config.resolve.alias = {
        ...config.resolve.alias,
        [path.resolve("node_modules/satellite.js/wasm-build/pthreads-release/index.js")]: emptyShim,
      };
    }
    return config;
  },
};

export default nextConfig;
