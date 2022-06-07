import { packageDefinition } from './../data/test-package-1.ts';
import { registry, PackageDefinition, BlockDefinition } from "../deps.ts";

import { Test, assert, assertExists, assertFalse, assertEquals } from "../deps.ts"

Test.test("register namespaced package", () => {
  const emptyPackage: PackageDefinition = {
    namespace: "org.cryptographix"
  }

  registry.reset();

  assertFalse(registry.hasPackage("org.cryptographix"));
  registry.registerPackage(emptyPackage);
  assert(registry.hasPackage("org"));
  assert(registry.hasPackage("org.cryptographix"));
});

Test.test("register sub-package", () => {
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

Test.test("register sub-package with block", () => {
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

Test.test("register packageDefinition with 2 code blocks", () => {
  registry.reset();

  registry.registerPackage(packageDefinition);
  assert(registry.hasPackage("test.blocks"));
  assert(registry.hasPackage("test.blocks"));
  assertExists(registry.getBlockInfo("test.blocks.printer"));
  assertExists(registry.getBlockInfo("test.blocks.printer2"));
});

Test.test("register.categories", () => {
  registry.reset();

  registry.registerPackage(packageDefinition);

  assertEquals(registry.categories.size, 1);

  // register another category
  registry.registerPackage( {
    namespace: "org.bananas",
    blocks: {
      "banana-split": { 
        type: "none",
        name: "banana-split",
        category: "splitters",
        // deno-lint-ignore no-explicit-any
        ctor: class { $helper!: any; run() {} },
        propertyDefinitions: {}
       }
    }
  });

  assertEquals(registry.categories.size, 2);
  const cats = registry.categories;

  assert(cats.has("outputs"));
  assert(cats.has("splitters"));
});


