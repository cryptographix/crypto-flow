import { InterfaceDefinition } from "../deps.ts";

export interface IFSecureRandom {
  randomData: Uint8Array;
}

export const IFSecureRandom: InterfaceDefinition = {
  name:   "ISecureRandom",
  propertyDefinitions: {
    randomData: { accessors: "get", dataType: "u8[]" },
  }
}
