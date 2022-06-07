//import { packageDefinition } from './../data/test-package-1.ts';
import { registry, PackageLoader, ImportDefinition} from "../deps.ts";

import { Test, assert, assertExists, assertEquals } from "../deps.ts"

function importUrlToBase() {
  let path = import.meta.url;

  path = path.slice(0, path.lastIndexOf('/'));
//  path = path.slice(0, path.lastIndexOf('/')+1);

  return path;
}

Test.test("load package", async ()=> {
  const importDef = new ImportDefinition( "test.blocks", {
    moduleURLs: ["./data/test-package-1.js"],
    importFilters: []
  });


  const loader = new PackageLoader(importUrlToBase(), importDef);

  await loader.loadPackages();

  assert(registry.hasPackage("test.blocks"));
  assert(registry.rootPackage.getPackage("test.blocks")?.blocks.size == 2)
  assertExists(registry.getBlockInfo("test.blocks.printer"));
  assertEquals(registry.getBlockInfo("test.blocks.printer").name,"printer");
});
  
//registry.registerPackage((await import(")).packageDefinition);


