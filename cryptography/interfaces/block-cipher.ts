import { InterfaceDefinition } from "../deps.ts";

export interface IFBlockCipher {
  direction: "encrypt" | "decrypt";

  plainText: Uint8Array;

  cipherText: Uint8Array;

  key: Uint8Array;

  blockSize: number;
}

export const IFBlockCipher: InterfaceDefinition<IFBlockCipher> = {
  name: "IFBlockCipher",

  propertyDefinitions: {
    // config
    direction: {
      accessors: "both",
      dataType: "enum",
      default: "encrypt",
      options: ["encrypt", "decrypt"],
    },

    // in
    plainText: { accessors: "set", dataType: "u8[]" },
    key: { accessors: "set", dataType: "u8[]" },

    // out
    blockSize: { accessors: "get", dataType: "integer" },
    cipherText: { accessors: "get", dataType: "u8[]" },
  }
};

