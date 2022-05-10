import { IBlock, IBlockInfo, getInterface } from "../deps.ts";
import {
  InterfacePropertyInfos,
  registerInterface,
} from "../deps.ts";

interface IBlockCipher {
  plainText: Uint8Array;

  cipherText: Uint8Array;

  key: Uint8Array;

  encrypt: boolean;

  blockSize: number;
}

const props: InterfacePropertyInfos<IBlockCipher> = {
  key: { access: "in", dataType: "u8[]" },
  encrypt: { access: "in", dataType: "boolean", default: true },
  plainText: { access: "in", dataType: "u8[]" },

  blockSize: { access: "out", dataType: "integer" },
  cipherText: { access: "out", dataType: "u8[]" },
};

const IBlockCipher = registerInterface<IBlockCipher>(
  "IBlockCipher",
  "org.cryptographix.cryptography",
  props,
);

const blockCipherInfo = getInterface<IBlockCipher>(IBlockCipher);

type IN = Pick<IBlockCipher, "plainText" | "key" | "encrypt">;
type OUT = Pick<IBlockCipher, "cipherText" | "blockSize">;

export class AESBlockCipher implements IBlock, IBlockCipher {
  plainText!: Uint8Array;

  key!: Uint8Array;

  encrypt = true;

  blockSize = 128;

  cipherText!: Uint8Array;

  constructor(init?: IN) {
    if (init) {
      this.#init(init);
    }
  }

  #init({ key, plainText, encrypt }: IN) {
    this.plainText = plainText;
    this.key = key;
    this.encrypt = encrypt;
  }

  setup(init: IN): void {
    this.#init(init);
  }

  process(): Promise<OUT> {
    return Promise.resolve(
      {
        cipherText: this.plainText,
        blockSize: this.blockSize,
      },
    );
  }

  teardown(): void {
  }

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
    },
  };
}
