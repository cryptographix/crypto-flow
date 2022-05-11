import { Block, IBlockInfo, getInterface } from "../deps.ts";
import { InterfacePropertyInfos, registerInterface } from "../deps.ts";

interface IFBlockCipher {
  direction: "encrypt" | "decrypt";

  plainText: Uint8Array;

  cipherText: Uint8Array;

  key: Uint8Array;

  blockSize: number;
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

// type CFG = Pick<IFBlockCipher, "direction">
// type IN = Pick<IFBlockCipher, "plainText" | "key">;
// type OUT = Pick<IFBlockCipher, "cipherText" | "blockSize">;

export class AESBlockCipher extends Block {
  key!: Uint8Array;

  direction!: "encrypt" | "decrypt";

  blockSize = 128;

  override setup({ direction }: Pick<IFBlockCipher, "direction">) {
    return super.setup( { direction } );
  }

  override process({ key, plainText }: Pick<IFBlockCipher, "plainText" | "key">): Promise<Pick<IFBlockCipher, "cipherText" | "blockSize">> {
    this.key = key;

    return Promise.resolve({
      cipherText: plainText,
      blockSize: this.blockSize,
    });
  }

  override teardown(): void {}

  static readonly blockInfo: IBlockInfo<AESBlockCipher> = {
    name: "AES Block Cipher",
    category: "crypto",
    namespace: "org.cryptographix.cryptography.block-ciphers",

    propInfo: {
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
        default: 16,
      },
    },
  };
}

console.log(JSON.stringify(AESBlockCipher.blockInfo, null, 2));

const cipher = new AESBlockCipher();
cipher.setup( { direction: "encrypt" } );

const out = await cipher.process( { key: new Uint8Array(), plainText: new Uint8Array() });

console.log( out );