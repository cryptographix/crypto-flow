import * as asserts from "https://deno.land/std@0.138.0/testing/asserts.ts";
export * from "https://deno.land/std@0.138.0/testing/asserts.ts";

export const Test = {
  test: Deno.test,
  ...asserts
};

