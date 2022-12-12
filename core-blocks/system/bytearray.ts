import { Block, BlockDefinition } from "../deps.ts";

class ByteArrayBlock
  implements Block<{output: Uint8Array}> {
  value: Uint8Array = new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]); 

  bytes!: Uint8Array;

  run(): void {
    this.bytes = this.value;
  }
}

export default {
  type: "block",
  ctor: ByteArrayBlock,
  name: "ByteArray",
  description: "Constant byte array",
  category: "system",

  properties: {
    value: {
      dataType: "u8[]",
      accessors: "set",
      kind: "config"
    },
    bytes: {
      dataType: "u8[]",
      accessors: "get",
      direction: "out"
    },
  },
} as BlockDefinition<ByteArrayBlock>;
