import { Block, BlockDefinition } from "../deps.ts";
import { IFByteArrayBinaryOperator } from "./binary-operator-interface.ts";

class XORBlock
  implements Block<IFByteArrayBinaryOperator>, IFByteArrayBinaryOperator {
  //
  op1!: Uint8Array;

  //
  op2!: Uint8Array;

  //
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

export default {
  type: "block",
  ctor: XORBlock,
  name: "XOR Bytes",
  category: "core-ops",

  properties: {
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
} as BlockDefinition<XORBlock>;
