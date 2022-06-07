import { Package } from "../deps.ts";
import { Test, assertExists, assertInstanceOf, assertEquals } from "../deps.ts"

Test.test("ensurePackage creates non-existent namespace", () => {
  const root = new Package();

  assertExists(root.ensurePackage("org.cryptographix.test"));
  assertInstanceOf(root.getPackage("org.cryptographix.test"), Package);
});

Test.test("ensurePackage creates namespace hierarchy", () => {
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

Test.test("getPackage understands package hierarchies", () => {
  const root = new Package();

  const test = root.getPackage("org")
    ?? root.getPackage("org.cryptographix")
    ?? root.getPackage("org.cryptographix.test");

  assertEquals(test, undefined);

  assertExists(root.ensurePackage("org.cryptographix.test"));

  const test2 = root.getPackage("org");
   
  assertInstanceOf(test2, Package);
  assertEquals(test2.name, "org");

  const test3 = root.getPackage("org")?.getPackage("cryptographix");

  assertInstanceOf(test3, Package);
  assertEquals(test3.name, "cryptographix");
  assertEquals(test3.namespace, "org.cryptographix");

  const test4 = root.getPackage("org") && root.getPackage("org.cryptographix") && root.getPackage("org.cryptographix.test");

  assertInstanceOf(test4, Package);
  assertEquals(test4.name, "test");
  assertEquals(test4.namespace, "org.cryptographix.test");
});

