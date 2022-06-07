import { AbstractBlock, BlockDefinition, BlockHelper } from "../deps.ts";
import { IFCryptographicHash } from "../interfaces/cryptographic-hash.ts";

type IN = Pick<IFCryptographicHash, "dataIn">;
type OUT = Pick<IFCryptographicHash, "hashValue" | "hashSize">;

// class SHA1HashBlock
//   implements Block<IFCryptographicHash>, IFCryptographicHash {
//  $helper!: BlockHelper<SHA1HashBlock>;
class SHA1HashBlock
  extends AbstractBlock<IFCryptographicHash> implements IFCryptographicHash {

  dataIn!: Uint8Array;

  hashSize!: number;

  hashValue!: Uint8Array;

  run(): void {
    const { dataIn } = this;

    const hashValue = new Uint8Array(20);

    // XOR hash
    for (let index = 0; index < dataIn.length; ++index) {
      hashValue[index % 20] = (hashValue[index % 20] << 1) ^ (hashValue[index % 20] >> 7) ^ dataIn[index];
    }

    this.hashValue = hashValue;
  }
}

export const SHA1Hash: BlockDefinition<SHA1HashBlock> = {
  type: "block",
  ctor: SHA1HashBlock,
  name: "SHA-1",
  category: "cryptography",

  propertyDefinitions: {
    ...IFCryptographicHash.propertyDefinitions,
    hashValue: {
      ...IFCryptographicHash.propertyDefinitions.hashValue,
      dataType: "u8[]",
      minLength: 20,
      maxLength: 20,
    },
    hashSize: {
      ...IFCryptographicHash.propertyDefinitions.hashSize,
      default: 160,
      constant: true,
    },
  },
};
