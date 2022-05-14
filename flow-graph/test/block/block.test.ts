import { Block, IBlockInfo, getInterface } from "../deps.ts";
import { InterfacePropertyInfos, registerInterface } from "../deps.ts";

interface IFBlockCipher {
  direction: "encrypt" | "decrypt";

  key: Uint8Array;

  blockSize: number;

  plainText: Uint8Array;

  cipherText: Uint8Array;
}

const blockCipherProps: InterfacePropertyInfos<IFBlockCipher> = {
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
};

const IFBlockCipher = registerInterface<IFBlockCipher>(
  "IBlockCipher",
  "org.cryptographix.cryptography",
  blockCipherProps
);

const blockCipherInfo = getInterface<IFBlockCipher>(IFBlockCipher);

export class AESBlockCipher extends Block<IFBlockCipher> implements IFBlockCipher {
  key!: Uint8Array;

  direction!: "encrypt" | "decrypt";

  blockSize = 128;

  plainText!: Uint8Array;

  cipherText!: Uint8Array;

  override setup({ direction }: Partial<IFBlockCipher>) {
    return super.setup({ direction });
  }

  override run(): void {
    const { key, plainText } = this;
    (key);
    this.cipherText = plainText;
  }

  static readonly blockInfo: IBlockInfo<AESBlockCipher> = {
    name: "AES Block Cipher",
    category: "crypto",
    namespace: "org.cryptographix.cryptography.block-ciphers",

    propertyInfos: {
      ...blockCipherInfo,
      key: {
        ...blockCipherInfo.key,
        dataType: "u8[]",
        minLength: 16,
        maxLength: 32,
        lengthStep: 8,
      },
      blockSize: {
        ...blockCipherInfo.blockSize,
        constant: true,
        default: 128,
      },
    },
  };
}

import { Test } from "../deps.ts";

Test.test({
  name: "Block extends registered interface",
  fn: () => {
    const propInfo = AESBlockCipher.blockInfo.propertyInfos;

    Test.assertEquals(Object.keys(propInfo).length, 5);
    Test.assertEquals(propInfo.plainText, blockCipherInfo.plainText);
    Test.assertNotEquals(propInfo.blockSize, blockCipherInfo.blockSize);
  },
});

Test.test({
  name: "Block setup and process",
  fn: async () => {
    const cipher = new AESBlockCipher();
    cipher.setup({ direction: "encrypt" });

    Test.assertEquals(cipher.direction, "encrypt", "setup");

    cipher.key = new Uint8Array( 16 );
    cipher.plainText  =  new Uint8Array( 16 );

    await cipher.run();

    const { blockSize, cipherText } = cipher;
    Test.assertEquals(blockSize, 128);
    Test.assertEquals(cipherText instanceof Uint8Array, true);
  },
});
