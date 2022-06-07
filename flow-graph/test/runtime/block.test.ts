import { AbstractBlock, BlockDefinition, BlockFactory, InterfaceDefinition } from "../deps.ts";

// 1. Declare an interface type
interface IFBlockCipher {
  direction: "encrypt" | "decrypt";

  key: Uint8Array;

  blockSize: number;

  plainText: Uint8Array;

  cipherText: Uint8Array;
}

// 2. Declare an InterfaceDefinition object that describes the interface
const IFBlockCipher: InterfaceDefinition<IFBlockCipher> = {
  name: "IFBlockCipher",

  namespace: "org.cryptographix.cryptography.interfaces",

  propertyDefinitions: {
    // config
    direction: {
      accessors: "both",
      dataType: "enum",
      default: "encrypt",
      options: ["encrypt", "decrypt"],
    },

    //
    plainText: { accessors: "set", dataType: "u8[]" },
    key: { accessors: "set", dataType: "u8[]" },

    // out
    blockSize: { accessors: "get", dataType: "integer" },
    cipherText: { accessors: "get", dataType: "u8[]" },
  }
};

export class XORBlockCipherBlock extends AbstractBlock<IFBlockCipher> {
 
  key!: Uint8Array;

  direction!: "encrypt" | "decrypt";

  blockSize = 64;

  plainText!: Uint8Array;

  cipherText!: Uint8Array;

  // setup(config: PartialPropertiesOf<XORBlockCipherBlock>) {
  //   return this.$helper.setup(config);
  // }

  run(): void {
    const { key, plainText, blockSize } = this;
    
    const cipherText = this.cipherText = plainText.slice();
    for( let idx = 0; idx < blockSize; ++idx) {
      cipherText[idx] = cipherText[idx] & key[idx];
    }
  }
}

const XORBlockCipher: BlockDefinition<XORBlockCipherBlock> = {
  type: "block",

  name: "XOR Block Cipher",

  category: "crypto",

  namespace: "org.cryptographix.cryptography.block-ciphers",

  ctor: XORBlockCipherBlock,

  propertyDefinitions: {
    ...IFBlockCipher.propertyDefinitions,
    key: {
      ...IFBlockCipher.propertyDefinitions.key,
      dataType: "u8[]",
      minLength: 8,
      maxLength: 8,
    },
    blockSize: {
      ...IFBlockCipher.propertyDefinitions.blockSize,
      constant: true,
      default: 64,
    },
  },
};

import { Test } from "../deps.ts";

Test.test({
  name: "Block extends registered interface",
  fn: () => {
    const propInfo = XORBlockCipher.propertyDefinitions;

    Test.assertEquals(Object.keys(propInfo).length, 5);
    Test.assertEquals(propInfo.plainText, IFBlockCipher.propertyDefinitions.plainText);
    Test.assertNotEquals(propInfo.blockSize, IFBlockCipher.propertyDefinitions.blockSize);
  },
});

Test.test({
  name: "Block setup and process",
  fn: async () => {
    const cipher = await BlockFactory.for(XORBlockCipher).createInstance();
    cipher.setup({ direction: "encrypt" });

    Test.assertEquals(cipher.direction, "encrypt", "setup");

    cipher.key = new Uint8Array(16);
    cipher.plainText = new Uint8Array(16);

    await cipher.run();

    const { blockSize, cipherText } = cipher;
    Test.assertEquals(blockSize, 128);
    Test.assertEquals(cipherText instanceof Uint8Array, true);
  },
});
