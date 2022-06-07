import { InterfaceDefinition } from "../deps.ts";

export interface IFCryptographicHash {
  dataIn: Uint8Array;

  hashValue: Uint8Array;

  hashSize: number;
}

export const IFCryptographicHash: InterfaceDefinition<IFCryptographicHash> = {
  name: "IFCryptographicHash",
  propertyDefinitions: {
    dataIn: { accessors: "set", dataType: "u8[]" },

    hashSize: { accessors: "get", dataType: "integer" },
    hashValue: { accessors: "get", dataType: "u8[]" },
  },
};
