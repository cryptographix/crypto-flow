import { packageDefinition } from './../data/test-package-1.ts';
import { registry, PackageDefinition, BlockDefinition } from "../deps.ts";

import { test, assert, assertExists, assertFalse, assertEquals } from "../test-harness.ts";

test("Registry: register namespaced package", () => {
  const emptyPackage: PackageDefinition = {
    namespace: "org.cryptographix"
  }

  registry.reset();

  assertFalse(registry.hasPackage("org.cryptographix"));
  registry.registerPackage(emptyPackage);
  assert(registry.hasPackage("org"));
  assert(registry.hasPackage("org.cryptographix"));
});

test("Registry: register sub-package", () => {
  const cgxTestPackage: PackageDefinition = {
    namespace: "org.cryptographix",
    packages: {
      "test": {}
    }
  }

  registry.reset();

  registry.registerPackage(cgxTestPackage);
  assert(registry.hasPackage("org.cryptographix"));
  assert(registry.hasPackage("org.cryptographix.test"));
});

test("Registry: register sub-package with block", () => {
  const cgxTestPackage: PackageDefinition = {
    namespace: "org.cryptographix",
    packages: {
      "test": {
        blocks: {
          "Blocky": { name: "Blocky" } as BlockDefinition
        }
      }
    }
  }

  registry.reset();

  registry.registerPackage(cgxTestPackage);
  assert(registry.hasPackage("org.cryptographix"));
  assert(registry.hasPackage("org.cryptographix.test"));
  assertExists(registry.getBlockInfo("org.cryptographix.test.Blocky"));
});

test("Registry: register packageDefinition with 2 code blocks", () => {
  registry.reset();

  registry.registerPackage(packageDefinition);
  assert(registry.hasPackage("test.blocks"));
  assertExists(registry.getBlockInfo("test.blocks.printer"));
  assertExists(registry.getBlockInfo("test.blocks.printer2"));
});

test("Registry: list categories", () => {
  registry.reset();

  registry.registerPackage(packageDefinition);

  assertEquals(registry.categories.size, 1);

  // register another category
  registry.registerPackage( {
    namespace: "org.bananas",
    blocks: {
      "banana-split": { 
        type: "block",
        name: "banana-split",
        category: "splitters",
        // deno-lint-ignore no-explicit-any
        ctor: class { $helper!: any; run() {} },
        properties: {}
       }
    }
  });

  assertEquals(registry.categories.size, 2);
  const cats = registry.categories;

  assert(cats.has("outputs"));
  assert(cats.has("splitters"));
});


