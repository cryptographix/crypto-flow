import { InterfaceDefinition } from "../deps.ts";

export interface IFEncryptDecrypt {
  plainText: Uint8Array;

  cipherText: Uint8Array;

  key: Uint8Array;

  encrypt: "encrypt" | "decrypt";

  blockSize: number;
}

export const IFEncryptionAlgorithm: InterfaceDefinition<IFEncryptDecrypt> = {
  name: "IFEncryptionAlgorithm",
  properties: {
    key: { accessors: "set", dataType: "u8[]" },
    encrypt: { accessors: "set", dataType: "string", default: "encrypt" },
    plainText: { accessors: "set", dataType: "u8[]" },

    blockSize: { accessors: "get", dataType: "integer" },
    cipherText: { accessors: "get", dataType: "u8[]" },
  }
};
