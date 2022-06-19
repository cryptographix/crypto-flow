import { BlockInterfaceDefinition } from "../deps.ts";

export interface IFCryptographicHash {
  dataIn: Uint8Array;

  hashValue: Uint8Array;

  hashSizeBits: number;
}

export const IFCryptographicHash: BlockInterfaceDefinition<IFCryptographicHash> = {
  name: "IFCryptographicHash",

  propertyDefinitions: {
    dataIn: { direction: "in", dataType: "u8[]" },

    hashSizeBits: { direction: "out", dataType: "integer" },
    hashValue: { direction: "out", dataType: "u8[]" },
  },
};
