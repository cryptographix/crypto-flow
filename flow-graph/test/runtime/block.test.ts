import { Block, BlockDefinition, BlockFactory, BlockHelper, InterfaceDefinition, PartialPropertiesOf } from "../deps.ts";

// 1. Interface type
interface IFBlockCipher {
  direction: "encrypt" | "decrypt";

  key: Uint8Array;

  blockSize: number;

  plainText: Uint8Array;

  cipherText: Uint8Array;
}

// 2. InterfaceDefinition object that describes the interface
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

// 3. Block that implements this interface
export class XORBlockCipherBlock implements Block<IFBlockCipher> {
  readonly $helper!: BlockHelper<Block<IFBlockCipher>>;
 
  key!: Uint8Array;

  direction!: "encrypt" | "decrypt";

  get blockSize() { return 64 }

  plainText!: Uint8Array;

  cipherText!: Uint8Array;

  setup(config: PartialPropertiesOf<XORBlockCipherBlock>) {
    return this.$helper.setup(config);
  }

  run(): void {
    const { key, plainText, blockSize } = this;
    
    const cipherText = this.cipherText = plainText.slice();
    for( let idx = 0; idx < blockSize; ++idx) {
      cipherText[idx] = cipherText[idx] & key[idx];
    }
  }
}

// 4. BlockDefinition object that describes the block, extending the interface definition
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

import { test, assertEquals, assertNotEquals } from "../test-harness.ts";

test({
  name: "Block: Definition correctly extends registered interface",
  fn: () => {
    const propInfo = XORBlockCipher.propertyDefinitions;

    assertEquals(Object.keys(propInfo).length, 5);
    assertEquals(propInfo.plainText, IFBlockCipher.propertyDefinitions.plainText);
    assertNotEquals(propInfo.blockSize, IFBlockCipher.propertyDefinitions.blockSize);
  },
});

test({
  name: "Block: setup and process execute normally",
  fn: async () => {
    const cipher = await BlockFactory.for(XORBlockCipher).createInstance();
    cipher.setup({ direction: "encrypt" });

    assertEquals(cipher.direction, "encrypt", "setup");

    cipher.key = new Uint8Array(16);
    cipher.plainText = new Uint8Array(16);

    await cipher.run();

    const { blockSize, cipherText } = cipher;
    assertEquals(blockSize, 64);
    assertEquals(cipherText instanceof Uint8Array, true);
  },
});

test({
  name: "Block: Factory performs lazy instantiation",
  fn: async () => {
    XORBlockCipher.ctor = () => Promise.resolve(new XORBlockCipherBlock());

    const cipher = await BlockFactory.for(XORBlockCipher).createInstance();
    cipher.setup({ direction: "encrypt" });

    assertEquals(cipher.direction, "encrypt", "setup");

    cipher.key = new Uint8Array(16);
    cipher.plainText = new Uint8Array(16);

    await cipher.run();

    const { blockSize, cipherText } = cipher;
    assertEquals(blockSize, 64);
    assertEquals(cipherText instanceof Uint8Array, true);
  },
});
