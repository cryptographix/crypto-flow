import {
  AbstractBlock,
  BlockDefinition,
  BlockHelper,
  PartialPropertiesOf,
} from "../../deps.ts";
import { IFBlockCipher } from "../../interfaces/block-cipher.ts";

interface IFBlockCipherMode extends IFBlockCipher {
  blockCipher: IFBlockCipher & AbstractBlock<IFBlockCipher>;
}

type IN = Pick<
  CBCCipherModeBlock,
  "plainText" | "key" | "direction" | "blockCipher"
>;
type OUT = Pick<CBCCipherModeBlock, "cipherText" | "blockSize">;

class CBCCipherModeBlock implements AbstractBlock<CBCCipherModeBlock>, IFBlockCipherMode {
  $helper!: BlockHelper<CBCCipherModeBlock>;

  blockCipher!: IFBlockCipher & AbstractBlock<IFBlockCipher>;

  direction: "encrypt" | "decrypt" = "encrypt";

  key!: Uint8Array;

  plainText!: Uint8Array;

  iv!: Uint8Array;

  blockSize!: number;

  cipherText!: Uint8Array;

  setup(config: PartialPropertiesOf<CBCCipherModeBlock>) {
    const { key, direction } = config;

    this.$helper.setup(config);

    if (this.blockCipher) {
      const blockCipher = this.blockCipher;

      blockCipher.setup({ direction, key });

      this.blockSize = blockCipher.blockSize;
    }
  }

  async run(): Promise<void> {
    const { direction, plainText, blockSize, blockCipher } = this;
    const chainVec = this.iv.slice();
    const blockLength = blockSize / 8;

    blockCipher.direction = direction;

    const cipherText = new Uint8Array(plainText.length);

    //    this.blockCipher.key = key;
    for (let i = 0; i < plainText.length; i += blockLength) {
      const block = blockCipher.plainText = plainText.slice(i, i + blockLength);

      if (direction == "encrypt") {
        for (let j = 0; j < blockLength; ++j) {
          block[j] = block[j] ^ chainVec[j];
        }

        await blockCipher.run();

        chainVec.set(blockCipher.cipherText);
      }
      else {
        await blockCipher.run();

        for (let j = 0; j < blockLength; ++j) {
          blockCipher.cipherText[j] = blockCipher.cipherText[j] ^ chainVec[j];
        }

        chainVec.set(block);
      }

      cipherText.set(blockCipher.cipherText, i);
    }

    this.cipherText = cipherText;
  }

  teardown(): void {
    // noop
  }
}

export const CBCBlockCipherMode: BlockDefinition<CBCCipherModeBlock> = {
  type: "block",
  ctor: CBCCipherModeBlock,
  name: "CBC Block Cipher Mode",
  category: "crypto",

  propertyDefinitions: {
    ...IFBlockCipher.propertyDefinitions,
    blockCipher: {
      dataType: "slot",
      accessors: "both",
      //implements: IFBlockCipher,
    },
    iv: { dataType: "u8[]", accessors: "set", minLength: 16, maxLength: 16 },
  },
};
