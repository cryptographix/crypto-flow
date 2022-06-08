import { registry, PackageLoader, ImportDefinition } from "../deps.ts";

import { test, assert, assertExists, assertEquals } from "../test-harness.ts";


function moduleImportToBasePath() {
  let path = import.meta.url;

  path = path.slice(0, path.lastIndexOf('/'));
  //  path = path.slice(0, path.lastIndexOf('/')+1);

  return path;
}

test("load js package", async () => {
  const importDef = new ImportDefinition("test.blocks", {
    moduleURLs: ["./data/test-package-1.js"],
    importFilters: []
  });

  const loader = new PackageLoader(importDef, moduleImportToBasePath());

  await loader.loadPackages();

  assert(registry.hasPackage("test.blocks"));
  assert(registry.rootPackage.getPackage("test.blocks")?.blocks.size == 2)
  assertExists(registry.getBlockInfo("test.blocks.printer"));
  assertEquals(registry.getBlockInfo("test.blocks.printer").name, "printer");
});

test("Loader: load package from json library", async () => {
  const importDef = new ImportDefinition("test.blocks", {
    moduleURLs: ["./data/library-1.json"],
    importFilters: []
  });

  const loader = new PackageLoader(importDef, moduleImportToBasePath());

  await loader.loadPackages();

  assert(registry.hasPackage("test.blocks"));
  assert(registry.rootPackage.getPackage("test.blocks")?.blocks.size == 2)
  assertExists(registry.getBlockInfo("test.blocks.printer"));
  assertEquals(registry.getBlockInfo("test.blocks.printer").name, "printer");
});

test("Loader: load package from json project", async () => {
  const importDef = new ImportDefinition("test.blocks", {
    moduleURLs: ["./data/project-1.json"],
    importFilters: []
  });

  const loader = new PackageLoader(importDef, moduleImportToBasePath());

  await loader.loadPackages();

  assert(registry.hasPackage("test.blocks"));
  assert(registry.rootPackage.getPackage("test.blocks")?.blocks.size == 2)
  assertExists(registry.getBlockInfo("test.blocks.printer"));
  assertEquals(registry.getBlockInfo("test.blocks.printer").name, "printer");
});


