// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: {
      test: "dev",
    },
    blob: true,
  },
  scriptModule: false,
  package: {
    // package.json properties
    name: "@cryptographix/flow-graph",
    version: Deno.args[0],
  //   description: "Your package.",
  //   license: "MIT",
  //   repository: {
  //     type: "git",
  //     url: "git+https://github.com/username/repo.git",
  //   },
  //   bugs: {
  //     url: "https://github.com/username/repo/issues",
  //   },
  },
});

