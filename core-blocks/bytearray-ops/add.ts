import { Block, BlockDefinition, BlockHelper } from "../deps.ts";
import { IFByteArrayBinaryOperator } from "./binary-operator-interface.ts";

class UnsignedWrappingADDBlock
  implements Block<IFByteArrayBinaryOperator>, IFByteArrayBinaryOperator {
  //
  $helper!: BlockHelper<UnsignedWrappingADDBlock>;

  op1!: Uint8Array;
  op2!: Uint8Array;
  result!: Uint8Array;

  run(): void {
    const { op1, op2 } = this;

    const result = new Uint8Array(op1.length);

    let carry = 0;
    for (let index = op1.length-1; index > 0; --index) {
      const sum = op1[index] + op2[index] + carry;

      result[index] = sum & 0xff;

      carry = (sum > 255) ? 1 : 0;
    }

    this.result = result;
  }
}

export const UnsignedWrappingADDBytes: BlockDefinition<UnsignedWrappingADDBlock> = {
  type: "block",
  ctor: UnsignedWrappingADDBlock,
  name: "ADD Bytes",
  description: "Wrapping unsigned byte-array addition",
  category: "core-ops",

  propertyDefinitions: {
    op1: {
      dataType: "u8[]",
      accessors: "set"
    },
    op2: {
      dataType: "u8[]",
      accessors: "set"
    },
    result: {
      dataType: "u8[]",
      accessors: "get"
    },
  },
};
