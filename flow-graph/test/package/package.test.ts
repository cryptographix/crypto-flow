import proj1 from "../data/project-1.json" assert { type: "json" }

import { Package } from "../deps.ts";
import { test, assert, assertExists, assertInstanceOf, assertEquals } from "../test-harness.ts";

test("Package: ensurePackage() creates non-existent namespace", () => {
  const root = new Package();

  assertExists(root.ensurePackage("org.cryptographix.test"));
  assertInstanceOf(root.getPackage("org.cryptographix.test"), Package);
});

test("Package: ensurePackage() maintains already existent namespace", () => {
  const root = new Package();

  assertExists(root.ensurePackage("org.cryptographix"));
  root.getPackage("org.cryptographix").description = "Description of org.cryptographix";
  assertExists(root.ensurePackage("org.cryptographix.test"));
  assertInstanceOf(root.getPackage("org.cryptographix.test"), Package);
  assert(root.getPackage("org.cryptographix").description, "Description of org.cryptographix");
});

test("Package: ensurePackage() creates namespace hierarchy", () => {
  const root = new Package();

  assertExists(root.ensurePackage("org.cryptographix.test"));

  const org = root.packages.get('org')!;
  assertInstanceOf(org, Package);
  assertEquals(org.name, "org");

  const cgx = org.getPackage('cryptographix')!
  assertInstanceOf(cgx, Package);
  assertEquals(cgx.name, "cryptographix");
  assertEquals(cgx.namespace, "org.cryptographix");

});

test("Package: getPackage() understands package hierarchies", () => {
  const root = new Package();

  const test = root.hasPackage("org")
    && root.hasPackage("org.cryptographix")
    && root.hasPackage("org.cryptographix.test");

  assertEquals(test, false);

  assertExists(root.ensurePackage("org.cryptographix.test"));

  const test2 = root.getPackage("org");
   
  assertInstanceOf(test2, Package);
  assertEquals(test2.name, "org");

  const test3 = root.getPackage("org")?.getPackage("cryptographix");

  assertInstanceOf(test3, Package);
  assertEquals(test3.name, "cryptographix");
  assertEquals(test3.namespace, "org.cryptographix");

  const test4 = root.getPackage("org.cryptographix.test");

  assertInstanceOf(test4, Package);
  assertEquals(test4.name, "test");
  assertEquals(test4.namespace, "org.cryptographix.test");
});

test("Package: parsePackage from project", async () => {
  const pack = await Package.parsePackage(proj1.project);

  // assert(pack.hasPackage("test.blocks"));
  assertEquals(pack.blocks.size, 1);

  const b1 = pack.blocks.get('invertor-block')!;
  assertExists(b1);

  //console.log(b1);
//  assertEquals(registry.getBlockInfo("test.blocks.printer").name, "printer");
});
