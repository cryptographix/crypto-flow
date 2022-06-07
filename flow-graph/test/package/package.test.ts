import { Package } from "../deps.ts";
import { Test, assertExists, assertInstanceOf, assertEquals } from "../deps.ts"

Test.test("ensurePackage creates non-existent namespace", () => {
  const root = new Package("");

  assertExists(root.ensurePackage("org.cryptographix.test"));
  assertInstanceOf(root.getPackage("org.cryptographix.test"), Package);
});

Test.test("ensurePackage creates namespace hierarchy", () => {
  const root = new Package("");

  assertExists(root.ensurePackage("org.cryptographix.test"));

  const org = root.getPackage('org')!;
  assertInstanceOf(org, Package);
  assertEquals(org.name, "org");

  const cgx = org.getPackage('cryptographix')!
  assertInstanceOf(cgx, Package);
  assertEquals(org.name, "cryptographix");
  assertEquals(org.namespace, "org.cryptographix");

});

Test.test("getPackage understands Hierarchy", () => {
  const root = new Package("");

  const test = root.getPackage("org.cryptographix.test")
  assertExists(test);
  assertInstanceOf(test, Package);
  assertEquals(test.name, "cryptographix");
  assertEquals(test.namespace, "org.cryptographix");

});

