import { Block, BlockDefinition, BlockHelper } from "../deps.ts";
import { IFByteArrayBinaryOperator } from "./binary-operator-interface.ts";

class XORBlock
  implements Block<IFByteArrayBinaryOperator>, IFByteArrayBinaryOperator {
  //
  $helper!: BlockHelper<XORBlock>;

  op1!: Uint8Array;
  op2!: Uint8Array;
  result!: Uint8Array;

  run(): void {
    const { op1, op2 } = this;

    const result = new Uint8Array(op1.length);

    for (let index = 0; index < op1.length; ++index) {
      result[index] = op1[index] ^ op2[index];
    }

    this.result = result;
  }
}

export const XORBytes: BlockDefinition<XORBlock> = {
  type: "block",
  ctor: XORBlock,
  name: "XOR Bytes",
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
