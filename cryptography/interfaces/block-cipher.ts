import { BlockInterfaceDefinition } from "../deps.ts";

export interface IFBlockCipher {
  direction: "encrypt" | "decrypt";

  plainText: Uint8Array;

  cipherText: Uint8Array;

  key: Uint8Array;

  blockSize: number;
}

export const IFBlockCipher: BlockInterfaceDefinition<IFBlockCipher> = {
  name: "IFBlockCipher",

  properties: {
    direction: {
      kind: "config",
      dataType: "enum",
      default: "encrypt",
      options: ["encrypt", "decrypt"],
    },

    // in
    plainText: { direction: "in", dataType: "u8[]" },
    key: { direction: "in", dataType: "u8[]" },

    // out
    blockSize: { direction: "out", accessors: "get", dataType: "integer" },
    cipherText: { direction: "out", dataType: "u8[]" },
  }
};

