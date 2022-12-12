import { InterfaceDefinition } from "../deps.ts";

export interface IFSecureRandom {
  randomData: Uint8Array;
}

export const IFSecureRandom: InterfaceDefinition = {
  name:   "ISecureRandom",
  properties: {
    randomData: { accessors: "get", dataType: "u8[]" },
  }
}
